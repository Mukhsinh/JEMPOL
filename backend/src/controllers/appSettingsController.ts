import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class AppSettingsController {
  // Mendapatkan semua pengaturan aplikasi
  async getSettings(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        console.error('Error fetching app settings:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengambil pengaturan aplikasi',
          error: error.message 
        });
      }

      // Return the raw data array for frontend processing
      res.json(data || []);
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mendapatkan pengaturan publik saja
  async getPublicSettings(req: Request, res: Response) {
    try {
      // Set response header untuk memastikan JSON response
      res.setHeader('Content-Type', 'application/json');
      
      console.log('🔄 GET /api/public/app-settings dipanggil (backend)');
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value, setting_type')
        .eq('is_public', true)
        .order('setting_key');

      if (error) {
        console.error('❌ Error fetching public settings:', error);
        
        // Return default settings jika error
        return res.status(200).json({ 
          success: true, 
          data: {
            institution_name: 'Rumah Sakit',
            institution_address: '',
            contact_phone: '',
            contact_email: '',
            website: '',
            app_footer: ''
          },
          warning: 'Using default settings - database query failed'
        });
      }

      const settings: Record<string, any> = {};
      data?.forEach((setting: any) => {
        let value = setting.setting_value;
        
        if (setting.setting_type === 'json' && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Failed to parse JSON for ${setting.setting_key}:`, e);
          }
        }
        
        if (setting.setting_type === 'boolean') {
          value = value === 'true' || value === true;
        }
        
        if (setting.setting_type === 'number' && value) {
          value = parseFloat(value);
        }

        settings[setting.setting_key] = value;
      });

      console.log('✅ Public settings fetched successfully');

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('❌ Error in getPublicSettings:', error);
      res.status(200).json({ 
        success: true, 
        data: {
          institution_name: 'Rumah Sakit',
          institution_address: '',
          contact_phone: '',
          contact_email: '',
          website: '',
          app_footer: ''
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update pengaturan aplikasi
  async updateSettings(req: Request, res: Response) {
    try {
      const updates = req.body;
      
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Data pengaturan tidak valid'
        });
      }

      const updatePromises = Object.entries(updates).map(async ([key, value]) => {
        // Convert value to string for storage
        let stringValue = '';
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else {
          stringValue = String(value || '');
        }

        // First try to update existing setting
        const { data: existingData, error: selectError } = await supabase
          .from('app_settings')
          .select('id')
          .eq('setting_key', key)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          throw new Error(`Failed to check existing setting ${key}: ${selectError.message}`);
        }

        if (existingData) {
          // Update existing setting
          const { error } = await supabase
            .from('app_settings')
            .update({
              setting_value: stringValue,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key);

          if (error) {
            throw new Error(`Failed to update ${key}: ${error.message}`);
          }
        } else {
          // Insert new setting
          const { error } = await supabase
            .from('app_settings')
            .insert({
              setting_key: key,
              setting_value: stringValue,
              setting_type: 'text',
              description: `Auto-created setting for ${key}`,
              is_public: ['app_name', 'app_logo', 'app_footer', 'institution_name', 'institution_address', 'institution_logo', 'logo_url', 'address', 'contact_email', 'contact_phone', 'website', 'description'].includes(key),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            throw new Error(`Failed to insert ${key}: ${error.message}`);
          }
        }
      });

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Pengaturan berhasil diperbarui'
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Gagal memperbarui pengaturan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update pengaturan tunggal
  async updateSetting(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { value, type } = req.body;

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Kunci pengaturan diperlukan'
        });
      }

      // Convert value to string for storage
      let stringValue = '';
      if (type === 'json' && typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else if (type === 'boolean') {
        stringValue = Boolean(value).toString();
      } else if (type === 'number') {
        stringValue = Number(value).toString();
      } else {
        stringValue = String(value || '');
      }

      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: stringValue,
          setting_type: type || 'text',
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) {
        console.error('Error updating setting:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal memperbarui pengaturan',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: `Pengaturan ${key} berhasil diperbarui`
      });
    } catch (error) {
      console.error('Error in updateSetting:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload logo
  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File logo diperlukan'
        });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;

      // Update logo path in database
      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'institution_logo');

      if (error) {
        console.error('Error updating logo:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Gagal memperbarui logo',
          error: error.message 
        });
      }

      res.json({
        success: true,
        message: 'Logo berhasil diunggah',
        logoUrl
      });
    } catch (error) {
      console.error('Error in uploadLogo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const appSettingsController = new AppSettingsController();