import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export class UnitController {
  async getUnits(req: Request, res: Response) {
    try {
      const { search, type, status } = req.query;
      
      let query = supabase
        .from('units')
        .select(`
          id, name, code, description, contact_email, contact_phone, 
          sla_hours, is_active, parent_unit_id, unit_type_id,
          created_at, updated_at,
          unit_type:unit_types(id, name, code, color, icon),
          parent_unit:units!parent_unit_id(name, code)
        `)
        .order('name');

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
      }

      if (type && type !== 'Semua Tipe') {
        // Join with unit_types to filter by type name
        const { data: unitTypeData } = await supabase
          .from('unit_types')
          .select('id')
          .eq('name', type)
          .single();
        
        if (unitTypeData?.id) {
          query = query.eq('unit_type_id', unitTypeData.id);
        }
      }

      if (status === 'active' || status === 'Aktif') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive' || status === 'Tidak Aktif' || status === 'Pemeliharaan') {
        query = query.eq('is_active', false);
      }

      const { data: units, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match frontend expectations
      const transformedUnits = (units || []).map((unit: any) => ({
        ...unit,
        unit_type: unit.unit_type ? {
          id: unit.unit_type.id,
          name: unit.unit_type.name,
          code: unit.unit_type.code,
          color: unit.unit_type.color || '#6B7280',
          icon: unit.unit_type.icon || 'domain'
        } : null
      }));

      res.json({ success: true, data: transformedUnits });
    } catch (error) {
      console.error('Error fetching units:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUnit(req: Request, res: Response) {
    try {
      const { name, code, description, unit_type_id, parent_unit_id, contact_email, contact_phone, sla_hours, is_active } = req.body;

      // Validasi input
      if (!name || !code) {
        return res.status(400).json({ 
          error: 'Nama unit dan kode wajib diisi' 
        });
      }

      // Cek duplikasi kode
      const { data: duplicateCode } = await supabase
        .from('units')
        .select('id')
        .eq('code', code)
        .single();

      if (duplicateCode) {
        return res.status(400).json({ 
          error: 'Kode unit sudah digunakan' 
        });
      }

      const { data: unit, error } = await supabase
        .from('units')
        .insert({
          name,
          code,
          description,
          unit_type_id: unit_type_id || null,
          parent_unit_id: parent_unit_id || null,
          contact_email,
          contact_phone,
          sla_hours: sla_hours || 24,
          is_active: is_active !== undefined ? is_active : true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json(unit);
    } catch (error: any) {
      console.error('Error creating unit:', error);
      res.status(500).json({ 
        error: error.message || 'Terjadi kesalahan saat membuat unit kerja' 
      });
    }
  }

  async updateUnit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description, unit_type_id, parent_unit_id, contact_email, contact_phone, sla_hours, is_active } = req.body;

      // Validasi input
      if (!name || !code) {
        return res.status(400).json({ 
          error: 'Nama unit dan kode wajib diisi' 
        });
      }

      // Cek apakah unit ada
      const { data: existingUnit, error: checkError } = await supabase
        .from('units')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingUnit) {
        return res.status(404).json({ 
          error: 'Unit kerja tidak ditemukan' 
        });
      }

      // Cek duplikasi kode (kecuali untuk unit yang sedang diedit)
      const { data: duplicateCode } = await supabase
        .from('units')
        .select('id')
        .eq('code', code)
        .neq('id', id)
        .single();

      if (duplicateCode) {
        return res.status(400).json({ 
          error: 'Kode unit sudah digunakan oleh unit lain' 
        });
      }

      const { data: unit, error } = await supabase
        .from('units')
        .update({
          name,
          code,
          description,
          unit_type_id: unit_type_id || null,
          parent_unit_id: parent_unit_id || null,
          contact_email,
          contact_phone,
          sla_hours: sla_hours || 24,
          is_active: is_active !== undefined ? is_active : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json(unit);
    } catch (error: any) {
      console.error('Error updating unit:', error);
      res.status(500).json({ 
        error: error.message || 'Terjadi kesalahan saat memperbarui unit kerja' 
      });
    }
  }

  async deleteUnit(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Cek apakah unit ada
      const { data: existingUnit, error: checkError } = await supabase
        .from('units')
        .select('id, name')
        .eq('id', id)
        .single();

      if (checkError || !existingUnit) {
        return res.status(404).json({ 
          error: 'Unit kerja tidak ditemukan' 
        });
      }

      // Check if unit has child units
      const { data: childUnits, error: childError } = await supabase
        .from('units')
        .select('id, name')
        .eq('parent_unit_id', id);

      if (childError) {
        throw childError;
      }

      if (childUnits && childUnits.length > 0) {
        return res.status(400).json({ 
          error: `Tidak dapat menghapus unit yang memiliki ${childUnits.length} sub-unit. Silakan hapus atau pindahkan sub-unit terlebih dahulu.` 
        });
      }

      // Check if unit has associated tickets
      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('unit_id', id)
        .limit(1);

      if (ticketError) {
        throw ticketError;
      }

      if (tickets && tickets.length > 0) {
        return res.status(400).json({ 
          error: 'Tidak dapat menghapus unit yang memiliki tiket terkait. Silakan pindahkan tiket terlebih dahulu.' 
        });
      }

      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      res.status(500).json({ 
        error: error.message || 'Terjadi kesalahan saat menghapus unit kerja' 
      });
    }
  }

  async getUnitTypes(req: Request, res: Response) {
    try {
      const { data: unitTypes, error } = await supabase
        .from('unit_types')
        .select('id, name, code, description, icon, color, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      res.json(unitTypes || []);
    } catch (error) {
      console.error('Error fetching unit types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getServiceCategories(req: Request, res: Response) {
    try {
      const { data: categories, error } = await supabase
        .from('service_categories')
        .select('id, name, code, description, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      res.json(categories || []);
    } catch (error) {
      console.error('Error fetching service categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTicketTypes(req: Request, res: Response) {
    try {
      const { data: ticketTypes, error } = await supabase
        .from('ticket_types')
        .select('id, name, code, description, icon, color, default_priority, default_sla_hours, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      res.json(ticketTypes || []);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTicketStatuses(req: Request, res: Response) {
    try {
      const { data: statuses, error } = await supabase
        .from('ticket_statuses')
        .select('id, name, code, description, status_type, color, is_final, display_order, is_active')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        throw error;
      }

      res.json(statuses || []);
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPatientTypes(req: Request, res: Response) {
    try {
      const { data: patientTypes, error } = await supabase
        .from('patient_types')
        .select('id, name, code, description, priority_level, default_sla_hours, is_active')
        .eq('is_active', true)
        .order('priority_level');

      if (error) {
        throw error;
      }

      res.json(patientTypes || []);
    } catch (error) {
      console.error('Error fetching patient types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSlaSettings(req: Request, res: Response) {
    try {
      const { data: slaSettings, error } = await supabase
        .from('sla_settings')
        .select(`
          id, name, priority_level, response_time_hours, resolution_time_hours, 
          escalation_time_hours, business_hours_only, is_active,
          unit_type:unit_types(name, code),
          service_category:service_categories(name, code),
          patient_type:patient_types(name, code)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      res.json(slaSettings || []);
    } catch (error) {
      console.error('Error fetching SLA settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAiTrustSettings(req: Request, res: Response) {
    try {
      const { data: aiSettings, error } = await supabase
        .from('ai_trust_settings')
        .select('id, setting_name, confidence_threshold, auto_routing_enabled, auto_classification_enabled, manual_review_required, description, is_active')
        .eq('is_active', true)
        .order('setting_name');

      if (error) {
        throw error;
      }

      res.json(aiSettings || []);
    } catch (error) {
      console.error('Error fetching AI trust settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateAiTrustSettings(req: Request, res: Response) {
    try {
      const { confidence_threshold, auto_routing_enabled, auto_classification_enabled, manual_review_required } = req.body;

      const { data: settings, error } = await supabase
        .from('ai_trust_settings')
        .update({
          confidence_threshold,
          auto_routing_enabled,
          auto_classification_enabled,
          manual_review_required,
          updated_at: new Date().toISOString()
        })
        .eq('setting_name', 'default')
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json(settings);
    } catch (error) {
      console.error('Error updating AI trust settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async importUnits(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
      }

      const fileExt = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase();
      let rows: any[] = [];

      if (fileExt === '.csv') {
        // Parse CSV
        const Papa = require('papaparse');
        const fileContent = req.file.buffer.toString('utf-8');
        
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim()
        });

        if (parseResult.errors.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Format file tidak valid',
            errors: parseResult.errors 
          });
        }

        rows = parseResult.data;
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        // Parse Excel
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          return res.status(400).json({ success: false, message: 'File Excel kosong' });
        }

        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell: any) => {
          headers.push(cell.value?.toString().trim() || '');
        });

        worksheet.eachRow((row: any, rowNumber: number) => {
          if (rowNumber === 1) return; // Skip header
          
          const rowData: any = {};
          row.eachCell((cell: any, colNumber: number) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value?.toString().trim() || '';
            }
          });
          
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        });
      } else {
        return res.status(400).json({ success: false, message: 'Format file tidak didukung. Gunakan CSV atau Excel' });
      }

      let imported = 0;
      const errors: string[] = [];

      // Get unit types mapping
      const { data: unitTypes } = await supabase
        .from('unit_types')
        .select('id, code');
      
      const unitTypeMap = new Map(unitTypes?.map(ut => [ut.code, ut.id]) || []);

      // Get existing units for parent mapping
      const { data: existingUnits } = await supabase
        .from('units')
        .select('id, code');
      
      const unitMap = new Map(existingUnits?.map(u => [u.code, u.id]) || []);

      for (let i = 0; i < rows.length; i++) {
        const row: any = rows[i];
        
        try {
          // Validate required fields
          if (!row['Nama Unit'] || !row['Kode']) {
            errors.push(`Baris ${i + 2}: Nama Unit dan Kode wajib diisi`);
            continue;
          }

          // Check if unit already exists
          const { data: existingUnit } = await supabase
            .from('units')
            .select('id')
            .eq('code', row['Kode'])
            .single();

          const unitData: any = {
            name: row['Nama Unit'],
            code: row['Kode'],
            description: row['Deskripsi'] || null,
            contact_email: row['Email Kontak'] || null,
            contact_phone: row['Telepon Kontak'] || null,
            sla_hours: parseInt(row['SLA (Jam)']) || 24,
            is_active: row['Status (Aktif/Tidak Aktif)']?.toLowerCase() === 'aktif'
          };

          // Map unit type
          if (row['Tipe Unit (Kode)']) {
            const unitTypeId = unitTypeMap.get(row['Tipe Unit (Kode)']);
            if (unitTypeId) {
              unitData.unit_type_id = unitTypeId;
            }
          }

          // Map parent unit
          if (row['Unit Induk (Kode)']) {
            const parentUnitId = unitMap.get(row['Unit Induk (Kode)']);
            if (parentUnitId) {
              unitData.parent_unit_id = parentUnitId;
            }
          }

          if (existingUnit) {
            // Update existing unit
            const { error } = await supabase
              .from('units')
              .update({
                ...unitData,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUnit.id);

            if (error) throw error;
          } else {
            // Insert new unit
            const { data: newUnit, error } = await supabase
              .from('units')
              .insert(unitData)
              .select('id, code')
              .single();

            if (error) throw error;
            
            // Add to map for parent reference
            if (newUnit) {
              unitMap.set(newUnit.code, newUnit.id);
            }
          }

          imported++;
        } catch (error: any) {
          errors.push(`Baris ${i + 2}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        imported,
        total: rows.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error importing units:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new UnitController();