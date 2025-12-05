import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Handle bulk photo upload
 */
async function handleBulkPhotoUpload(req: Request, res: Response, files: Express.Multer.File[]) {
  const uploadedPhotos: any[] = [];
  const errors: string[] = [];

  try {
    console.log('=== BULK PHOTO UPLOAD START ===');
    console.log('Number of files:', files.length);
    console.log('Request body:', req.body);
    
    const { title, description } = req.body;

    if (!title || !description) {
      console.error('Missing title or description');
      // Delete all uploaded files if validation fails
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi harus diisi',
      });
    }

    // Validate all files are images
    for (const file of files) {
      if (!file.mimetype.includes('image')) {
        errors.push(`${file.originalname}: Bukan file foto`);
      }
    }

    if (errors.length > 0) {
      // Delete all uploaded files
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      return res.status(400).json({
        success: false,
        error: 'Semua file harus berupa foto (JPG, PNG, GIF, WEBP)',
        details: errors,
      });
    }

    // Upload each photo to database
    console.log('Starting to upload photos to database...');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileUrl = `/uploads/${file.filename}`;
      const photoTitle = files.length > 1 ? `${title} - Foto ${i + 1}` : title;

      console.log(`Uploading photo ${i + 1}/${files.length}:`, {
        title: photoTitle,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      try {
        const insertData = {
          title: photoTitle,
          description: description.trim(),
          type: 'photo',
          category: 'photo',
          file_url: fileUrl,
          file_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype,
          uploaded_by: 'admin',
        };
        
        console.log('Insert data:', insertData);
        
        const { data, error } = await supabase
          .from('innovations')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Supabase error for file:', file.originalname);
          console.error('Error details:', JSON.stringify(error, null, 2));
          errors.push(`${file.originalname}: ${error.message || 'Database error'}`);
          // Delete file if database save fails
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        } else {
          console.log('Successfully uploaded photo:', data.id);
          uploadedPhotos.push(data);
        }
      } catch (error: any) {
        console.error('Exception uploading file:', file.originalname);
        console.error('Exception details:', error);
        errors.push(`${file.originalname}: ${error.message || 'Unknown error'}`);
        // Delete file if database save fails
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }
    
    console.log('Upload summary:', {
      total: files.length,
      successful: uploadedPhotos.length,
      failed: errors.length,
    });

    if (uploadedPhotos.length === 0) {
      console.error('All photos failed to upload');
      console.error('Errors:', errors);
      return res.status(500).json({
        success: false,
        error: 'Gagal mengupload semua foto',
        details: errors,
      });
    }

    console.log('=== BULK PHOTO UPLOAD SUCCESS ===');
    return res.status(201).json({
      success: true,
      data: uploadedPhotos,
      message: `Berhasil mengupload ${uploadedPhotos.length} dari ${files.length} foto`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('=== BULK PHOTO UPLOAD EXCEPTION ===');
    console.error('Error in bulk photo upload:', error);
    console.error('Stack:', error.stack);
    
    // Delete all uploaded files on error
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengupload foto: ' + error.message,
    });
  }
}

/**
 * Get all innovations
 * GET /api/innovations
 */
export const getAllInnovations = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from('innovations')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (type && (type === 'powerpoint' || type === 'pdf' || type === 'video' || type === 'photo')) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching innovations:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil data inovasi',
    });
  }
};

/**
 * Upload new innovation
 * POST /api/innovations or POST /api/innovations/bulk-photos
 */
export const uploadInnovation = async (req: Request, res: Response) => {
  // Handle multiple files (bulk photo upload) - check this first before try-catch
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    return await handleBulkPhotoUpload(req, res, files);
  }

  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { title, description } = req.body;
    const file = req.file;

    // Handle single file upload
    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'File harus diupload',
      });
    }

    if (!title || !description) {
      console.error('Missing title or description');
      // Delete uploaded file if validation fails
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      return res.status(400).json({
        success: false,
        error: 'Judul dan deskripsi harus diisi',
      });
    }

    // Determine type based on mimetype
    let type: 'powerpoint' | 'pdf' | 'video' | 'photo';
    let category: 'innovation' | 'video' | 'photo';
    
    if (file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation')) {
      type = 'powerpoint';
      category = 'innovation';
    } else if (file.mimetype === 'application/pdf') {
      type = 'pdf';
      category = 'innovation';
    } else if (file.mimetype.includes('video')) {
      type = 'video';
      category = 'video';
    } else if (file.mimetype.includes('image')) {
      type = 'photo';
      category = 'photo';
    } else {
      console.error('Invalid file type:', file.mimetype);
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      return res.status(400).json({
        success: false,
        error: 'Tipe file tidak valid. Hanya PowerPoint, PDF, Video, dan Foto yang diperbolehkan.',
      });
    }

    // Create file URL (in production, this would be cloud storage URL)
    const fileUrl = `/uploads/${file.filename}`;

    console.log('Creating innovation record in Supabase...');
    const { data, error } = await supabase
      .from('innovations')
      .insert({
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        file_url: fileUrl,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: 'admin',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Delete file if database save fails
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      throw error;
    }

    console.log('Innovation saved successfully:', data.id);

    res.status(201).json({
      success: true,
      data,
      message: 'File berhasil diupload',
    });
  } catch (error: any) {
    console.error('Error uploading innovation:', error);
    console.error('Error stack:', error.stack);

    // Delete file if database save fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log('Deleted file after error:', req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat mengupload file: ' + error.message,
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

    // Get innovation data first
    const { data: innovation, error: fetchError } = await supabase
      .from('innovations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !innovation) {
      return res.status(404).json({
        success: false,
        error: 'Inovasi tidak ditemukan',
      });
    }

    // Delete file from storage
    const filePath = path.join(process.cwd(), innovation.file_url);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('innovations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      success: true,
      message: 'Inovasi berhasil dihapus',
    });
  } catch (error: any) {
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

    const { data, error } = await supabase.rpc('increment_innovation_views', {
      innovation_id: id,
    });

    if (error) {
      // Fallback: manual increment
      const { data: innovation, error: fetchError } = await supabase
        .from('innovations')
        .select('views')
        .eq('id', id)
        .single();

      if (fetchError || !innovation) {
        return res.status(404).json({
          success: false,
          error: 'Inovasi tidak ditemukan',
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from('innovations')
        .update({ views: (innovation.views || 0) + 1 })
        .eq('id', id)
        .select('views')
        .single();

      if (updateError) {
        throw updateError;
      }

      return res.json({
        success: true,
        data: { views: updated.views },
      });
    }

    res.json({
      success: true,
      data: { views: data },
    });
  } catch (error: any) {
    console.error('Error incrementing view:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan',
    });
  }
};
