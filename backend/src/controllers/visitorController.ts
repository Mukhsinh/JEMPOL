import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

/**
 * Register new visitor
 * POST /api/visitors
 */
export const registerVisitor = async (req: Request, res: Response) => {
  try {
    console.log('=== VISITOR REGISTRATION START ===');
    console.log('Request body:', req.body);
    
    const { nama, instansi, jabatan, no_handphone } = req.body;

    // Validation
    if (!nama || !instansi || !jabatan || !no_handphone) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Semua field harus diisi',
      });
    }

    // Validate data types and length
    if (typeof nama !== 'string' || nama.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nama harus minimal 2 karakter',
      });
    }

    if (typeof instansi !== 'string' || instansi.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Instansi harus minimal 2 karakter',
      });
    }

    if (typeof jabatan !== 'string' || jabatan.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Jabatan harus minimal 2 karakter',
      });
    }

    if (typeof no_handphone !== 'string' || no_handphone.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Nomor handphone tidak valid',
      });
    }

    // Get IP address
    const ip_address = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    const insertData = {
      nama: nama.trim(),
      instansi: instansi.trim(),
      jabatan: jabatan.trim(),
      no_handphone: no_handphone.trim(),
      ip_address: Array.isArray(ip_address) ? ip_address[0] : ip_address,
    };

    console.log('Inserting visitor data:', insertData);

    const { data, error } = await supabase
      .from('visitors')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Visitor registered successfully:', data.id);
    console.log('=== VISITOR REGISTRATION SUCCESS ===');

    res.status(201).json({
      success: true,
      data,
      message: 'Pendaftaran berhasil',
    });
  } catch (error: any) {
    console.error('=== VISITOR REGISTRATION ERROR ===');
    console.error('Error registering visitor:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Data pengunjung sudah terdaftar',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mendaftar: ' + (error.message || 'Unknown error'),
    });
  }
};

/**
 * Get all visitors
 * GET /api/visitors
 */
export const getAllVisitors = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil data pengunjung',
    });
  }
};

/**
 * Delete visitor
 * DELETE /api/visitors/:id
 */
export const deleteVisitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('visitors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      message: 'Data pengunjung berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menghapus data pengunjung',
    });
  }
};

/**
 * Get visitor statistics
 * GET /api/visitors/stats
 */
export const getVisitorStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*');

    if (error) {
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      today: data?.filter((v: any) => {
        const today = new Date();
        const registeredDate = new Date(v.registered_at);
        return registeredDate.toDateString() === today.toDateString();
      }).length || 0,
      thisWeek: data?.filter((v: any) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(v.registered_at) >= weekAgo;
      }).length || 0,
      thisMonth: data?.filter((v: any) => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(v.registered_at) >= monthAgo;
      }).length || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil statistik',
    });
  }
};
