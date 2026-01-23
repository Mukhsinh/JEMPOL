import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Vercel akan inject environment variables dari dashboard
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate ticket number
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { data: lastTicket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .like('ticket_number', `TKT-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (lastTicket && lastTicket.length > 0) {
    const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `TKT-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
    console.log('🎯 POST /api/public/external-tickets dipanggil');
    
    const {
      reporter_identity_type,
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_address,
      age_range,
      service_type,
      category,
      service_category_id,
      patient_type_id,
      title,
      description,
      qr_code,
      unit_id,
      source = 'web'
    } = req.body;

    console.log('📥 Received external ticket request:', {
      reporter_identity_type,
      reporter_name,
      unit_id,
      service_type,
      category,
      service_category_id,
      patient_type_id,
      title,
      source
    });

    // Validasi unit_id - HARUS ADA
    if (!unit_id) {
      console.error('❌ Unit ID tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi'
      });
    }

    // Validasi field wajib
    if (!title || !description) {
      console.error('❌ Field wajib tidak lengkap');
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi harus diisi'
      });
    }

    // Validasi service_type
    const validServiceTypes = ['complaint', 'request', 'suggestion', 'survey'];
    if (!service_type || !validServiceTypes.includes(service_type)) {
      console.error('❌ Service type tidak valid:', service_type);
      return res.status(400).json({
        success: false,
        error: 'Jenis layanan harus diisi (complaint, request, suggestion, atau survey)',
        received: service_type,
        valid_types: validServiceTypes
      });
    }

    // Validasi source
    const validSources = ['web', 'qr_code', 'mobile', 'email', 'phone'];
    const finalSource = validSources.includes(source) ? source : 'web';
    console.log('✅ Using source:', finalSource);

    // Verifikasi unit_id exists dan aktif
    const { data: unitData, error: unitCheckError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', unit_id)
      .eq('is_active', true)
      .single();

    if (unitCheckError || !unitData) {
      console.error('❌ Unit tidak valid atau tidak aktif:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Unit tidak valid atau tidak aktif',
        unit_id: unit_id,
        details: unitCheckError?.message
      });
    }

    console.log('✅ Unit verified:', unitData.name);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    console.log('✅ Generated ticket number:', ticketNumber);

    // Calculate SLA deadline based on service type
    const slaDeadline = new Date();
    if (service_type === 'complaint') {
      slaDeadline.setHours(slaDeadline.getHours() + 24);
    } else if (service_type === 'request') {
      slaDeadline.setHours(slaDeadline.getHours() + 48);
    } else {
      slaDeadline.setHours(slaDeadline.getHours() + 72);
    }

    const isAnonymous = reporter_identity_type === 'anonymous';

    // Mapping service_type ke type yang valid di database
    const serviceTypeMapping: { [key: string]: string } = {
      'complaint': 'complaint',
      'request': 'information',
      'suggestion': 'suggestion',
      'survey': 'satisfaction'
    };
    
    const mappedType = serviceTypeMapping[service_type] || 'complaint';
    console.log(`✅ Mapped service_type '${service_type}' to type '${mappedType}'`);

    // Determine priority
    let priority = 'medium';
    if (service_type === 'complaint') {
      priority = 'high';
    } else if (service_type === 'request') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Find QR code ID if provided
    let qr_code_id = null;
    if (qr_code) {
      try {
        const { data: qrData } = await supabase
          .from('qr_codes')
          .select('id')
          .eq('token', qr_code)
          .eq('is_active', true)
          .single();
        
        if (qrData) {
          qr_code_id = qrData.id;
          console.log('✅ Found QR code ID:', qr_code_id);
        }
      } catch (error) {
        console.log('⚠️ Error finding QR code:', error);
      }
    }

    // Prepare ticket data
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: mappedType,
      title: title,
      description: description,
      unit_id: unit_id,
      qr_code_id: qr_code_id,
      priority: priority,
      status: 'open',
      sla_deadline: slaDeadline.toISOString(),
      source: finalSource,
      is_anonymous: isAnonymous,
      submitter_name: isAnonymous ? null : reporter_name,
      submitter_email: isAnonymous ? null : reporter_email,
      submitter_phone: isAnonymous ? null : reporter_phone,
      submitter_address: isAnonymous ? null : reporter_address
    };

    // Add category_id if provided
    const finalCategoryId = service_category_id || category || null;
    if (finalCategoryId) {
      ticketData.category_id = finalCategoryId;
      console.log('✅ Using category_id:', finalCategoryId);
    }
    
    // Add patient_type_id if provided
    if (patient_type_id) {
      ticketData.patient_type_id = patient_type_id;
      console.log('✅ Using patient_type_id:', patient_type_id);
    }

    console.log('📤 Inserting ticket data:', {
      ticket_number: ticketData.ticket_number,
      type: ticketData.type,
      service_type_original: service_type,
      unit_id: ticketData.unit_id,
      priority: ticketData.priority,
      status: ticketData.status,
      source: ticketData.source,
      is_anonymous: ticketData.is_anonymous,
      category_id: ticketData.category_id || 'null'
    });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        units:unit_id(name, code)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating external ticket:', error);
      
      let errorMessage = 'Gagal membuat tiket';
      if (error.code === '23503') {
        errorMessage = 'Data referensi tidak valid (unit_id atau category_id tidak ditemukan)';
      } else if (error.code === '23505') {
        errorMessage = 'Nomor tiket sudah ada, silakan coba lagi';
      } else if (error.code === '23514') {
        errorMessage = `Tipe tiket tidak valid. Diterima: ${ticketData.type}. Harus salah satu dari: information, complaint, suggestion, satisfaction`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: error.details || error.hint || null,
        error_code: error.code
      });
    }

    console.log('✅ External ticket created successfully:', ticket.ticket_number);

    // Update QR code usage count if applicable
    if (qr_code_id) {
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

        console.log('✅ Updated QR code usage count');
      } catch (error) {
        console.log('⚠️ Error updating QR code usage:', error);
      }
    }

    return res.status(201).json({
      success: true,
      ticket_number: ticket.ticket_number,
      data: ticket,
      message: 'Tiket berhasil dibuat. Nomor tiket Anda: ' + ticket.ticket_number
    });
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR in create external ticket handler:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // PERBAIKAN: Pastikan header JSON tetap di-set
    try {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } catch (headerError) {
      console.error('❌ Cannot set header:', headerError);
    }
    
    // Return JSON valid dengan informasi error lengkap
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      error_type: error.name || 'UnknownError',
      details: error.stack?.split('\n').slice(0, 3).join('\n') || null,
      timestamp: new Date().toISOString()
    });
  }
}
