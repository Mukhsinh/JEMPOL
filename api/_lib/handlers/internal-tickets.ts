import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import { setAPIHeaders } from '../utils/headers';
import { buildErrorResponse, buildSuccessResponse, buildConfigErrorResponse, buildValidationErrorResponse, getErrorStatusCode } from '../utils/response';
import { logRequest, logError, logSuccess, logWarn, logValidationError, logDatabase } from '../utils/logger';
import { validateInternalTicketData, validateUUID, validateEnum } from '../validators/request';
import { validateUnit, validateCategory, validateQRCode, findCategoryByNameOrCode } from '../validators/database';

/**
 * Generate unique ticket number for internal tickets
 * Format: INT-YYYY-NNNN
 */
async function generateTicketNumber(): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const year = new Date().getFullYear();
  
  try {
    const { data: lastTicket, error } = await supabase
      .from('tickets')
      .select('ticket_number')
      .like('ticket_number', `INT-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      logError('Error querying last ticket number', error);
      // If error, start from 1
      return `INT-${year}-0001`;
    }

    let nextNumber = 1;
    if (lastTicket && lastTicket.length > 0) {
      const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const ticketNumber = `INT-${year}-${nextNumber.toString().padStart(4, '0')}`;
    logSuccess('Generated ticket number', { ticket_number: ticketNumber });
    return ticketNumber;
  } catch (error: any) {
    logError('Failed to generate ticket number', error);
    // Fallback: use timestamp-based number
    const timestamp = Date.now().toString().slice(-4);
    return `INT-${year}-${timestamp}`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endpoint = '/api/public/internal-tickets';
  
  // Set headers FIRST - before any logic
  setAPIHeaders(res);
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'CORS preflight OK' });
  }
  
  // Log request
  logRequest(req.method || 'UNKNOWN', endpoint);
  
  // Wrapper untuk memastikan SELALU return JSON
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      logWarn('Method not allowed', { method: req.method });
      return res.status(405).json(
        buildErrorResponse(
          { message: 'Method not allowed. Only POST is supported.' },
          endpoint
        )
      );
    }

    // Validate Supabase configuration
    if (!isSupabaseConfigured()) {
      logError('Supabase not configured', new Error('Missing credentials'));
      return res.status(500).json(buildConfigErrorResponse(endpoint));
    }
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      logError('Supabase client is null', new Error('Client initialization failed'));
      return res.status(500).json(buildConfigErrorResponse(endpoint));
    }
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      logValidationError('request_body', 'Body must be JSON object', req.body);
      return res.status(400).json(
        buildErrorResponse(
          { message: 'Request body tidak valid', details: 'Body harus berupa JSON object' },
          endpoint
        )
      );
    }
    
    // Extract data from request
    const {
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_department,
      reporter_position,
      category,
      category_id,
      priority,
      title,
      description,
      qr_code,
      unit_id,
      source = 'web'
    } = req.body;

    // Validate internal ticket data
    const validationResult = validateInternalTicketData(req.body);
    if (!validationResult.valid) {
      logValidationError('internal_ticket_data', validationResult.errors.join(', '), req.body);
      
      // Log detail untuk debugging
      console.error('❌ Validation failed:');
      console.error('  - Errors:', validationResult.errors);
      console.error('  - Received data:', JSON.stringify(req.body, null, 2));
      
      const fieldErrors: Record<string, string> = {};
      validationResult.errors.forEach((error, index) => {
        fieldErrors[`field_${index}`] = error;
      });
      
      return res.status(400).json(buildValidationErrorResponse(fieldErrors, endpoint));
    }

    // Validate source enum
    const sourceValidation = validateEnum(source, ['web', 'qr_code', 'mobile', 'email', 'phone'], 'Source', 'web');
    const finalSource = sourceValidation.sanitized || 'web';

    // Validate priority enum
    const priorityValidation = validateEnum(priority, ['low', 'medium', 'high', 'critical'], 'Priority', 'medium');
    const finalPriority = priorityValidation.sanitized || 'medium';

    // Validate unit_id (REQUIRED untuk internal ticket)
    const uuidValidation = validateUUID(unit_id, 'Unit ID');
    if (!uuidValidation.valid) {
      logValidationError('unit_id', uuidValidation.errors.join(', '), unit_id);
      return res.status(400).json(
        buildErrorResponse(
          { message: 'Unit ID tidak valid', details: uuidValidation.errors.join(', ') },
          endpoint
        )
      );
    }

    const unitValidation = await validateUnit(supabase, unit_id);
    if (!unitValidation.valid) {
      logValidationError('unit_id', unitValidation.error || 'Unit not found', unit_id);
      return res.status(400).json(
        buildErrorResponse(
          { message: 'Unit tidak valid atau tidak aktif', details: unitValidation.error },
          endpoint
        )
      );
    }

    logSuccess('Unit validated', { unit_name: unitValidation.data?.name });

    // Validate category_id (optional)
    let finalCategoryId = null;
    const categoryInput = category_id || category;
    
    if (categoryInput && categoryInput.trim() !== '') {
      // Check if it's a UUID
      const categoryUuidValidation = validateUUID(categoryInput, 'Category ID');
      
      if (categoryUuidValidation.valid) {
        // It's a UUID, validate directly
        const categoryValidation = await validateCategory(supabase, categoryInput);
        if (categoryValidation.valid) {
          finalCategoryId = categoryInput;
          logSuccess('Category validated', { category_name: categoryValidation.data?.name });
        } else {
          logWarn('Category validation failed, setting to null', { category_id: categoryInput, error: categoryValidation.error });
        }
      } else {
        // Not a UUID, try to find by name or code
        const categorySearch = await findCategoryByNameOrCode(supabase, categoryInput);
        if (categorySearch.valid) {
          finalCategoryId = categorySearch.data?.id;
          logSuccess('Category found by name/code', { category_name: categorySearch.data?.name });
        } else {
          logWarn('Category not found by name/code, setting to null', { category: categoryInput });
        }
      }
    }

    // Find QR code ID if provided
    let qr_code_id = null;
    if (qr_code && qr_code.trim() !== '') {
      const qrValidation = await validateQRCode(supabase, qr_code);
      if (qrValidation.valid) {
        qr_code_id = qrValidation.data?.id;
        logSuccess('QR code validated', { qr_id: qr_code_id });
      } else {
        logWarn('QR code validation failed', { qr_code, error: qrValidation.error });
      }
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();

    // Calculate SLA deadline based on priority
    const slaDeadline = new Date();
    if (finalPriority === 'critical') {
      slaDeadline.setHours(slaDeadline.getHours() + 4);
    } else if (finalPriority === 'high') {
      slaDeadline.setHours(slaDeadline.getHours() + 24);
    } else if (finalPriority === 'medium') {
      slaDeadline.setHours(slaDeadline.getHours() + 48);
    } else {
      slaDeadline.setHours(slaDeadline.getHours() + 72);
    }

    // Gabungkan info department dan position ke dalam description
    const fullDescription = reporter_department || reporter_position
      ? `${description}\n\n--- Info Pelapor ---\nDepartemen: ${reporter_department || '-'}\nJabatan: ${reporter_position || '-'}`
      : description;

    // Prepare ticket data
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: 'complaint', // Internal ticket = complaint
      title: title,
      description: fullDescription,
      unit_id: unit_id,
      category_id: finalCategoryId,
      qr_code_id: qr_code_id,
      priority: finalPriority,
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: finalSource,
      is_anonymous: false,
      submitter_name: reporter_name || null,
      submitter_email: reporter_email || null,
      submitter_phone: reporter_phone || null,
      ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || null,
      user_agent: req.headers['user-agent'] || null
    };

    // Insert ticket into database
    logDatabase('INSERT', 'tickets', { 
      ticket_number: ticketNumber, 
      type: 'complaint',
      priority: finalPriority,
      has_category: !!finalCategoryId
    });
    
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (ticketError) {
      logError('Failed to insert ticket', ticketError, { ticketData });
      const statusCode = getErrorStatusCode(ticketError);
      return res.status(statusCode).json(buildErrorResponse(ticketError, endpoint));
    }

    logSuccess('Internal ticket created successfully', { 
      ticket_number: ticket.ticket_number,
      ticket_id: ticket.id
    });

    // Update QR code usage count (non-blocking)
    if (qr_code_id) {
      (async () => {
        try {
          const { data: currentQR } = await supabase
            .from('qr_codes')
            .select('usage_count')
            .eq('id', qr_code_id)
            .single();
          
          await supabase
            .from('qr_codes')
            .update({
              usage_count: (currentQR?.usage_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', qr_code_id);

          logSuccess('QR code usage updated', { qr_id: qr_code_id });
        } catch (error: any) {
          logWarn('Failed to update QR code usage (non-critical)', { qr_id: qr_code_id, error: error.message });
        }
      })();
    }

    // Return success response
    return res.status(201).json(
      buildSuccessResponse(
        {
          ticket_number: ticket.ticket_number,
          id: ticket.id,
          created_at: ticket.created_at,
          unit: ticket.units
        },
        `Tiket berhasil dibuat. Nomor tiket: ${ticket.ticket_number}`
      )
    );

  } catch (error: any) {
    logError('CRITICAL ERROR in internal ticket handler', error, { endpoint });
    
    // Ensure JSON response even on critical error
    const errorResponse = buildErrorResponse(error, endpoint);
    
    if (!res.headersSent) {
      return res.status(500).json(errorResponse);
    }
  }
}
