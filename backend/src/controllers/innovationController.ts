import { Request, Response } from 'express';
import Innovation from '../models/Innovation.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get all innovations
 * GET /api/innovations
 */
export const getAllInnovations = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const query: any = {};
    if (type && (type === 'powerpoint' || type === 'video')) {
      query.type = type;
    }

    const innovations = await Innovation.find(query)
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: innovations,
    });
  } catch (error) {
    console.error('Error fetching innovations:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil data inovasi',
    });
  }
};

/**
 * Upload new innovation
 * POST /api/innovations
 */
export const uploadInnovation = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'File harus diupload',
      });
    }

    if (!title || !description) {
      // Delete uploaded file if validation fails
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi harus diisi',
      });
    }

    // Determine type based on mimetype
    let type: 'powerpoint' | 'video';
    if (file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation')) {
      type = 'powerpoint';
    } else if (file.mimetype.includes('video')) {
      type = 'video';
    } else {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        error: 'Tipe file tidak valid',
      });
    }

    // Create file URL (in production, this would be cloud storage URL)
    const fileUrl = `/uploads/${file.filename}`;

    const innovation = new Innovation({
      title: title.trim(),
      description: description.trim(),
      type,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: 'admin', // TODO: Get from auth
    });

    await innovation.save();

    res.status(201).json({
      success: true,
      data: innovation,
      message: 'File berhasil diupload',
    });
  } catch (error: any) {
    console.error('Error uploading innovation:', error);

    // Delete file if database save fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengupload file',
    });
  }
};

/**
 * Delete innovation
 * DELETE /api/innovations/:id
 */
export const deleteInnovation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const innovation = await Innovation.findById(id);

    if (!innovation) {
      return res.status(404).json({
        success: false,
        error: 'Inovasi tidak ditemukan',
      });
    }

    // Delete file from storage
    const filePath = path.join(process.cwd(), innovation.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    await Innovation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Inovasi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting innovation:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat menghapus inovasi',
    });
  }
};

/**
 * Increment view count
 * POST /api/innovations/:id/view
 */
export const incrementView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const innovation = await Innovation.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!innovation) {
      return res.status(404).json({
        success: false,
        error: 'Inovasi tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: { views: innovation.views },
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
    });
  }
};
