import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - gunakan variable yang benar (tanpa VITE_ prefix untuk backend)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.error('   SUPABASE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper function to generate ticket number
async function generateTicketNumber(): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const year = new Date().getFullYear();
  const { data: lastTicket } = await supabase
    .from('tickets')
    .select('ticket_number')
    .like('ticket_number', `INT-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (lastTicket && lastTicket.length > 0) {
    const lastNumber = parseInt(lastTicket[0].ticket_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `INT-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRITICAL: Set headers PERTAMA SEBELUM SEMUA LOGIC
  // Pastikan SEMUA response adalah JSON, tidak ada HTML yang bocor
  const setHeaderSafe = (key: string, value: string) => {
    try {
      if (!res.headersSent) {
        res.setHeader(key, value);
      }
    } catch (e) {
      console.error(`Failed to set header ${key}:`, e);
    }
  };

  // Set headers di awal
  setHeaderSafe('Access-Control-Allow-Origin', '*');
  setHeaderSafe('Access-Control-Allow-Methods', 'POST, OPTIONS');
  setHeaderSafe('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  setHeaderSafe('Content-Type', 'application/json; charset=utf-8');
  setHeaderSafe('Cache-Control', 'no-cache, no-store, must-revalidate');
  setHeaderSafe('X-Content-Type-Options', 'nosniff');
  
  // PERBAIKAN: Wrapper try-catch untuk memastikan SELALU return JSON
  try {
    console.log('🎯 Vercel Function: /api/public/internal-tickets');
    console.log('📍 Method:', req.method);
    console.log('📍 URL:', req.url);
    console.log('📍 Headers:', JSON.stringify(req.headers, null, 2));
    
    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
      console.log('✅ OPTIONS request handled');
      return res.status(200).json({ success: true, message: 'CORS preflight OK' });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      console.error('❌ Method not allowed:', req.method);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed. Use POST method.`,
        allowed_methods: ['POST', 'OPTIONS'],
        received_method: req.method
      });
    }

    // Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey || !supabase) {
      console.error('❌ Supabase credentials missing');
      console.error('   VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
      console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
      console.error('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
      
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap. Hubungi administrator.',
        details: 'Supabase credentials not configured in Vercel environment variables'
      });
    }
    
    console.log('✅ Supabase credentials OK');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
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

    console.log('📋 Parsed data:', {
      reporter_name,
      reporter_email,
      unit_id,
      category,
      category_id,
      priority,
      title: title?.substring(0, 50),
      source
    });

    // Validasi unit_id - HARUS ADA dan harus UUID yang valid
    if (!unit_id) {
      console.error('❌ Unit ID tidak ada');
      return res.status(400).json({
        success: false,
        error: 'Unit ID harus diisi'
      });
    }

    // Validasi format UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(unit_id)) {
      console.error('❌ Unit ID format tidak valid:', unit_id);
      return res.status(400).json({
        success: false,
        error: 'Format Unit ID tidak valid. Harus berupa UUID.',
        received_unit_id: unit_id
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

    // Validasi priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const finalPriority = validPriorities.includes(priority) ? priority : 'medium';
    console.log('✅ Using priority:', finalPriority);

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
      console.error('❌ Unit check error:', unitCheckError);
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

    // Add category_id if provided - dengan validasi UUID
    const finalCategoryId = category_id || category || null;
    if (finalCategoryId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCategoryId);
      if (isUUID) {
        // Validasi bahwa category_id exists di database
        const { data: categoryCheck } = await supabase
          .from('service_categories')
          .select('id')
          .eq('id', finalCategoryId)
          .eq('is_active', true)
          .single();
        
        if (categoryCheck) {
          ticketData.category_id = finalCategoryId;
          console.log('✅ Using category_id (UUID):', finalCategoryId);
        } else {
          console.log('⚠️ Category ID tidak ditemukan di database, akan di-set null');
        }
      } else {
        try {
          const categoryMap: { [key: string]: string } = {
            'it_support': 'IT Support',
            'facility': 'Fasilitas',
            'equipment': 'Peralatan',
            'hr': 'SDM',
            'admin': 'Administrasi',
            'other': 'Lainnya'
          };
          
          const categoryName = categoryMap[finalCategoryId] || finalCategoryId;
          console.log('🔍 Looking for category:', categoryName);
          
          const { data: categoryData } = await supabase
            .from('service_categories')
            .select('id')
            .or(`name.ilike.%${categoryName}%,code.ilike.%${finalCategoryId}%`)
            .eq('is_active', true)
            .limit(1);
          
          if (categoryData && categoryData.length > 0) {
            ticketData.category_id = categoryData[0].id;
            console.log('✅ Found category ID from name/code:', ticketData.category_id);
          } else {
            console.log('⚠️ Category not found, will use null');
          }
        } catch (error) {
          console.log('⚠️ Error finding category:', error);
        }
      }
    }

    console.log('📤 Inserting ticket data:', {
      ticket_number: ticketData.ticket_number,
      type: ticketData.type,
      unit_id: ticketData.unit_id,
      priority: ticketData.priority,
      status: ticketData.status,
      source: ticketData.source,
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
      console.error('❌ Error creating internal ticket:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
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
        error_code: error.code,
        ticket_data_sent: {
          ticket_number: ticketData.ticket_number,
          type: ticketData.type,
          unit_id: ticketData.unit_id,
          category_id: ticketData.category_id
        }
      });
    }

    console.log('✅ Internal ticket created successfully:', ticket.ticket_number);

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
    console.error('❌ CRITICAL ERROR in create internal ticket handler:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // PERBAIKAN: Pastikan header JSON tetap di-set dengan safe method
    try {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    } catch (headerError) {
      console.error('❌ Cannot set header:', headerError);
    }
    
    // Return JSON valid dengan informasi error lengkap
    // Pastikan tidak ada HTML yang bocor
    const errorResponse = {
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      error_type: error.name || 'UnknownError',
      details: process.env.NODE_ENV === 'development' ? error.stack?.split('\n').slice(0, 3).join('\n') : null,
      timestamp: new Date().toISOString(),
      endpoint: '/api/public/internal-tickets'
    };
    
    // Pastikan response adalah JSON murni
    if (!res.headersSent) {
      res.status(500);
      res.json(errorResponse);
    }
    return;
  }
}
