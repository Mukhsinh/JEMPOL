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
  try {
    // Set CORS dan Content-Type headers PERTAMA KALI
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
        error: 'Method not allowed. Use POST method.'
      });
    }

    // Validasi Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials missing');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server tidak lengkap. Hubungi administrator.',
        details: 'Supabase credentials not configured'
      });
    }
    console.log('🎯 POST /api/public/internal-tickets dipanggil');
    
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

    console.log('📥 Received internal ticket request:', {
      reporter_name,
      reporter_email,
      unit_id,
      category,
      category_id,
      priority,
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

    // Prepare ticket data - ADOPSI DARI EXTERNAL TICKETS YANG BERHASIL
    const ticketData: any = {
      ticket_number: ticketNumber,
      type: 'complaint', // PERBAIKAN: Gunakan 'complaint' untuk internal ticket (sesuai external yang berhasil)
      title: title,
      description: description,
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
      submitter_address: null, // PERBAIKAN: Tambahkan field yang ada di external tickets
      ip_address: null, // PERBAIKAN: Tambahkan field yang ada di external tickets
      user_agent: null // PERBAIKAN: Tambahkan field yang ada di external tickets
    };

    // PERBAIKAN: Tambahkan info department dan position ke description seperti di publicRoutes.ts
    if (reporter_department || reporter_position) {
      ticketData.description = `${description}\n\n--- Info Pelapor ---\nDepartemen: ${reporter_department || '-'}\nJabatan: ${reporter_position || '-'}`;
    }

    // Add category_id if provided - ADOPSI DARI EXTERNAL TICKETS
    const finalCategoryId = category_id || category || null;
    if (finalCategoryId) {
      ticketData.category_id = finalCategoryId;
      console.log('✅ Using category_id:', finalCategoryId);
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
    console.error('❌ Error in create internal ticket handler:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      details: error.stack?.split('\n')[0] || null
    });
  }
}
