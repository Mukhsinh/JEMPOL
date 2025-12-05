import { Request, Response } from 'express';
import Visitor from '../models/Visitor.js';

/**
 * Register a new visitor
 * POST /api/visitors
 */
export const registerVisitor = async (req: Request, res: Response) => {
  try {
    const { nama, instansi, jabatan, noHandphone } = req.body;

    // Validate required fields
    if (!nama || !instansi || !jabatan || !noHandphone) {
      return res.status(400).json({
        success: false,
        error: 'Semua field harus diisi',
      });
    }

    // Get IP address
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Create visitor
    const visitor = new Visitor({
      nama: nama.trim(),
      instansi: instansi.trim(),
      jabatan: jabatan.trim(),
      noHandphone: noHandphone.trim(),
      ipAddress,
    });

    await visitor.save();

    res.status(201).json({
      success: true,
      data: {
        id: visitor._id,
        registeredAt: visitor.registeredAt,
      },
      message: 'Pendaftaran berhasil',
    });
  } catch (error: any) {
    console.error('Error registering visitor:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mendaftar',
    });
  }
};

/**
 * Get all visitors (admin only)
 * GET /api/visitors
 */
export const getAllVisitors = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const query: any = {};

    // Search by name or institution
    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { instansi: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [visitors, total] = await Promise.all([
      Visitor.find(query)
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Visitor.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: visitors,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil data pengunjung',
    });
  }
};

/**
 * Export visitors to CSV
 * GET /api/visitors/export
 */
export const exportVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await Visitor.find()
      .sort({ registeredAt: -1 })
      .lean();

    // Create CSV content
    const headers = ['Nama', 'Instansi', 'Jabatan', 'No. Handphone', 'Tanggal Daftar'];
    const rows = visitors.map(v => [
      v.nama,
      v.instansi,
      v.jabatan,
      v.noHandphone,
      new Date(v.registeredAt).toLocaleString('id-ID'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=pengunjung.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting visitors:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengekspor data',
    });
  }
};
