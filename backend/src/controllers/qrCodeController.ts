import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

// Generate unique QR code
const generateQRCode = (): string => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

// Generate secure token
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const createQRCode = async (req: Request, res: Response) => {
  try {
    const { unit_id, name, description, redirect_type, auto_fill_unit, show_options } = req.body;

    // Validate required fields
    if (!unit_id || !name) {
      return res.status(400).json({
        error: 'unit_id dan name wajib diisi'
      });
    }

    // Check if unit exists
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('id', unit_id)
      .single();

    if (unitError || !unit) {
      return res.status(404).json({
        error: 'Unit tidak ditemukan'
      });
    }

    // Generate unique code and token
    let code: string;
    let isUnique = false;
    let attempts = 0;

    do {
      code = generateQRCode();
      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', code)
        .single();
      
      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < 10);

    if (!isUnique) {
      return res.status(500).json({
        error: 'Gagal generate kode QR yang unik'
      });
    }

    const token = generateToken();

    // Create QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .insert({
        unit_id,
        code,
        token,
        name,
        description,
        is_active: true,
        usage_count: 0,
        redirect_type: redirect_type || 'selection',
        auto_fill_unit: auto_fill_unit !== false,
        show_options: show_options || ['internal_ticket', 'external_ticket', 'survey']
      })
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      return res.status(500).json({
        error: 'Gagal membuat QR code'
      });
    }

    // Initialize analytics record
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('qr_code_analytics')
      .insert({
        qr_code_id: qrCode.id,
        scan_date: today,
        scan_count: 0,
        ticket_count: 0,
        unique_visitors: 0
      });

    res.status(201).json({
      success: true,
      qr_code: qrCode,
      qr_url: `${req.protocol}://${req.get('host')}/m/${code}`,
      message: 'QR Code berhasil dibuat'
    });

  } catch (error) {
    console.error('Error in createQRCode:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getQRCodes = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      unit_id, 
      is_active, 
      search,
      include_analytics = false 
    } = req.query;

    let query = supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description
        )
      `);

    // Apply filters
    if (unit_id) {
      query = query.eq('unit_id', unit_id);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: qrCodes, error, count } = await query;

    if (error) {
      console.error('Error fetching QR codes:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data QR codes'
      });
    }

    // Add analytics if requested
    let enrichedQRCodes = qrCodes;
    if (include_analytics === 'true' && qrCodes) {
      enrichedQRCodes = await Promise.all(
        qrCodes.map(async (qrCode) => {
          const analytics = await getQRCodeAnalytics(qrCode.id);
          return {
            ...qrCode,
            analytics
          };
        })
      );
    }

    res.json({
      qr_codes: enrichedQRCodes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getQRCodes:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getQRCodeByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code,
          description,
          contact_email,
          contact_phone
        )
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !qrCode) {
      return res.status(404).json({
        error: 'QR Code tidak ditemukan atau tidak aktif'
      });
    }

    // Update scan analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Get current analytics for today
    const { data: currentAnalytics } = await supabase
      .from('qr_code_analytics')
      .select('scan_count')
      .eq('qr_code_id', qrCode.id)
      .eq('scan_date', today)
      .single();
    
    // Update or insert analytics
    if (currentAnalytics) {
      await supabase
        .from('qr_code_analytics')
        .update({
          scan_count: (currentAnalytics.scan_count || 0) + 1
        })
        .eq('qr_code_id', qrCode.id)
        .eq('scan_date', today);
    } else {
      await supabase
        .from('qr_code_analytics')
        .insert({
          qr_code_id: qrCode.id,
          scan_date: today,
          scan_count: 1,
          ticket_count: 0,
          unique_visitors: 1
        });
    }

    // Update usage count on QR code
    const { data: currentQR } = await supabase
      .from('qr_codes')
      .select('usage_count')
      .eq('id', qrCode.id)
      .single();
    
    await supabase
      .from('qr_codes')
      .update({ 
        usage_count: (currentQR?.usage_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCode.id);

    res.json(qrCode);

  } catch (error) {
    console.error('Error in getQRCodeByCode:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const updateQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, redirect_type, auto_fill_unit, show_options } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (redirect_type !== undefined) updateData.redirect_type = redirect_type;
    if (auto_fill_unit !== undefined) updateData.auto_fill_unit = auto_fill_unit;
    if (show_options !== undefined) updateData.show_options = show_options;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        units:unit_id (
          id,
          name,
          code
        )
      `)
      .single();

    if (error) {
      console.error('Error updating QR code:', error);
      return res.status(500).json({
        error: 'Gagal memperbarui QR code'
      });
    }

    res.json({
      success: true,
      qr_code: qrCode,
      message: 'QR Code berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error in updateQRCode:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const deleteQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if QR code has associated tickets
    const { data: tickets, error: ticketError } = await supabase
      .from('external_tickets')
      .select('id')
      .eq('qr_code_id', id)
      .limit(1);

    if (ticketError) {
      console.error('Error checking QR code usage:', ticketError);
      return res.status(500).json({
        error: 'Gagal memeriksa penggunaan QR code'
      });
    }

    if (tickets && tickets.length > 0) {
      return res.status(400).json({
        error: 'QR Code tidak dapat dihapus karena sudah digunakan untuk tiket'
      });
    }

    // Delete analytics first
    await supabase
      .from('qr_code_analytics')
      .delete()
      .eq('qr_code_id', id);

    // Delete QR code
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting QR code:', error);
      return res.status(500).json({
        error: 'Gagal menghapus QR code'
      });
    }

    res.json({
      success: true,
      message: 'QR Code berhasil dihapus'
    });

  } catch (error) {
    console.error('Error in deleteQRCode:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getQRCodeAnalytics = async (qrCodeId: string) => {
  try {
    // Get last 30 days analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analytics, error } = await supabase
      .from('qr_code_analytics')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .gte('scan_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('scan_date', { ascending: true });

    if (error) {
      console.error('Error fetching QR analytics:', error);
      return null;
    }

    if (!analytics || analytics.length === 0) {
      return {
        scans_30d: 0,
        tickets_30d: 0,
        trend: Array(5).fill(0)
      };
    }

    const totalScans = analytics.reduce((sum, day) => sum + (day.scan_count || 0), 0);
    const totalTickets = analytics.reduce((sum, day) => sum + (day.ticket_count || 0), 0);

    // Generate trend data (last 5 data points)
    const trend = analytics.slice(-5).map(day => day.scan_count || 0);
    while (trend.length < 5) {
      trend.unshift(0);
    }

    return {
      scans_30d: totalScans,
      tickets_30d: totalTickets,
      trend
    };

  } catch (error) {
    console.error('Error in getQRCodeAnalytics:', error);
    return null;
  }
};

export const getQRCodeAnalyticsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date_from, date_to } = req.query;

    let query = supabase
      .from('qr_code_analytics')
      .select('*')
      .eq('qr_code_id', id);

    if (date_from) {
      query = query.gte('scan_date', date_from);
    }
    if (date_to) {
      query = query.lte('scan_date', date_to);
    }

    const { data: analytics, error } = await query
      .order('scan_date', { ascending: true });

    if (error) {
      console.error('Error fetching QR analytics:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data analitik'
      });
    }

    // Calculate summary statistics
    const totalScans = analytics?.reduce((sum, day) => sum + (day.scan_count || 0), 0) || 0;
    const totalTickets = analytics?.reduce((sum, day) => sum + (day.ticket_count || 0), 0) || 0;
    const totalUniqueVisitors = analytics?.reduce((sum, day) => sum + (day.unique_visitors || 0), 0) || 0;

    // Calculate conversion rate
    const conversionRate = totalScans > 0 ? (totalTickets / totalScans) * 100 : 0;

    res.json({
      analytics: analytics || [],
      summary: {
        total_scans: totalScans,
        total_tickets: totalTickets,
        total_unique_visitors: totalUniqueVisitors,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        average_daily_scans: analytics?.length ? Math.round((totalScans / analytics.length) * 100) / 100 : 0
      }
    });

  } catch (error) {
    console.error('Error in getQRCodeAnalyticsById:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};

export const getQRCodeStats = async (req: Request, res: Response) => {
  try {
    // Get total QR codes
    const { count: totalQRCodes } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });

    // Get active QR codes
    const { count: activeQRCodes } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total scans (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scanData } = await supabase
      .from('qr_code_analytics')
      .select('scan_count, ticket_count')
      .gte('scan_date', thirtyDaysAgo.toISOString().split('T')[0]);

    const totalScans = scanData?.reduce((sum, day) => sum + (day.scan_count || 0), 0) || 0;
    const totalTickets = scanData?.reduce((sum, day) => sum + (day.ticket_count || 0), 0) || 0;

    // Get top performing QR codes
    const { data: topQRCodes } = await supabase
      .from('qr_codes')
      .select(`
        id,
        name,
        code,
        usage_count,
        units:unit_id (name)
      `)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(5);

    res.json({
      total_qr_codes: totalQRCodes || 0,
      active_qr_codes: activeQRCodes || 0,
      inactive_qr_codes: (totalQRCodes || 0) - (activeQRCodes || 0),
      total_scans_30d: totalScans,
      total_tickets_30d: totalTickets,
      conversion_rate: totalScans > 0 ? Math.round((totalTickets / totalScans) * 10000) / 100 : 0,
      top_performing: topQRCodes || []
    });

  } catch (error) {
    console.error('Error in getQRCodeStats:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan internal server'
    });
  }
};