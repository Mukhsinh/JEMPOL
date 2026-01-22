import { Request, Response } from 'express'; // Trigger restart

import supabase, { supabaseAdmin } from '../config/supabase.js';

// Unit Types
export const getUnitTypes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('unit_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching unit types:', error);
    res.status(500).json({ error: 'Failed to fetch unit types' });
  }
};

export const createUnitType = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Creating unit type with data:', req.body);

    // Validasi data yang dikirim
    const { name, code, description, icon, color, is_active } = req.body;

    if (!name || !code) {
      console.error('❌ Validation failed: name or code missing');
      return res.status(400).json({ 
        error: 'Nama dan Kode wajib diisi' 
      });
    }

    // Gunakan RPC function untuk bypass RLS
    const { data, error } = await supabaseAdmin.rpc('create_unit_type', {
      p_name: name,
      p_code: code,
      p_description: description || null,
      p_icon: icon || 'corporate_fare',
      p_color: color || '#6B7280',
      p_is_active: is_active !== undefined ? is_active : true
    });

    if (error) {
      console.error('❌ RPC error:', error);
      
      // Handle specific error messages
      if (error.message && error.message.includes('sudah digunakan')) {
        return res.status(400).json({ 
          error: 'Kode unit type sudah digunakan' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Gagal menambahkan tipe unit',
        details: error.message,
        hint: error.hint || 'Pastikan semua field terisi dengan benar'
      });
    }

    // RPC returns array, get first item
    const result = Array.isArray(data) ? data[0] : data;
    
    console.log('✅ Unit type created successfully:', result);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('❌ Error creating unit type:', error);
    res.status(500).json({ 
      error: 'Gagal menambahkan tipe unit',
      details: error.message || 'Unknown error',
      hint: 'Pastikan semua field terisi dengan benar'
    });
  }
};

export const updateUnitType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('unit_types')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating unit type:', error);
    res.status(500).json({ error: 'Failed to update unit type' });
  }
};

export const deleteUnitType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('unit_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting unit type:', error);
    res.status(500).json({ error: 'Failed to delete unit type' });
  }
};

// Service Categories
export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ error: 'Failed to fetch service categories' });
  }
};

export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating service category:', error);
    res.status(500).json({ error: 'Failed to create service category' });
  }
};

export const updateServiceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('service_categories')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating service category:', error);
    res.status(500).json({ error: 'Failed to update service category' });
  }
};

export const deleteServiceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service category:', error);
    res.status(500).json({ error: 'Failed to delete service category' });
  }
};

// Ticket Types
export const getTicketTypes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ticket_types')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
};

export const createTicketType = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ticket_types')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating ticket type:', error);
    res.status(500).json({ error: 'Failed to create ticket type' });
  }
};

export const updateTicketType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('ticket_types')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating ticket type:', error);
    res.status(500).json({ error: 'Failed to update ticket type' });
  }
};

export const deleteTicketType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('ticket_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    res.status(500).json({ error: 'Failed to delete ticket type' });
  }
};

// Ticket Classifications
export const getTicketClassifications = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_classifications')
      .select('*')
      .order('level', { ascending: true })
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching ticket classifications:', error);
    res.status(500).json({ error: 'Failed to fetch ticket classifications' });
  }
};

export const createTicketClassification = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_classifications')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating ticket classification:', error);
    res.status(500).json({ error: 'Failed to create ticket classification' });
  }
};

export const updateTicketClassification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ticket_classifications')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating ticket classification:', error);
    res.status(500).json({ error: 'Failed to update ticket classification' });
  }
};

export const deleteTicketClassification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ticket_classifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket classification:', error);
    res.status(500).json({ error: 'Failed to delete ticket classification' });
  }
};

// Ticket Statuses
export const getTicketStatuses = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_statuses')
      .select('*')
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching ticket statuses:', error);
    res.status(500).json({ error: 'Failed to fetch ticket statuses' });
  }
};

export const createTicketStatus = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_statuses')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating ticket status:', error);
    res.status(500).json({ error: 'Failed to create ticket status' });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ticket_statuses')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

export const deleteTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ticket_statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket status:', error);
    res.status(500).json({ error: 'Failed to delete ticket status' });
  }
};

// Patient Types
export const getPatientTypes = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Getting patient types...');

    // Gunakan supabaseAdmin yang sudah dikonfigurasi dengan fallback
    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Patient types query error:', error);
      throw error;
    }

    console.log('✅ Patient types retrieved:', data?.length || 0, 'records');

    res.json(data || []);

  } catch (error: any) {
    console.error('❌ Patient types error:', error);
    res.status(500).json({
      error: 'Gagal mengambil data patient types',
      details: error.message
    });
  }
};

export const createPatientType = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating patient type:', error);
    res.status(500).json({ error: 'Failed to create patient type' });
  }
};

export const updatePatientType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validasi data yang dikirim
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Pastikan priority_level dalam range yang benar
    if (updateData.priority_level && (updateData.priority_level < 1 || updateData.priority_level > 5)) {
      return res.status(400).json({ 
        error: 'Level prioritas harus antara 1 sampai 5' 
      });
    }

    // Pastikan default_sla_hours positif
    if (updateData.default_sla_hours && updateData.default_sla_hours < 1) {
      return res.status(400).json({ 
        error: 'SLA default harus minimal 1 jam' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('patient_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Patient type updated successfully:', id);
    res.json(data);
  } catch (error: any) {
    console.error('❌ Error updating patient type:', error);
    res.status(500).json({ 
      error: 'Gagal memperbarui data jenis pasien',
      details: error.message 
    });
  }
};

export const deletePatientType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Cek apakah patient type digunakan di tabel lain
    const { data: slaUsage, error: slaError } = await supabaseAdmin
      .from('sla_settings')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (slaError) throw slaError;

    if (slaUsage && slaUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di Pengaturan SLA. Hapus atau ubah pengaturan SLA terkait terlebih dahulu.' 
      });
    }

    // Cek apakah digunakan di tickets
    const { data: ticketUsage, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (ticketError) throw ticketError;

    if (ticketUsage && ticketUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di tiket. Tidak dapat menghapus data yang sudah digunakan.' 
      });
    }

    // Cek apakah digunakan di external_tickets
    const { data: externalUsage, error: externalError } = await supabaseAdmin
      .from('external_tickets')
      .select('id')
      .eq('patient_type_id', id)
      .limit(1);

    if (externalError) throw externalError;

    if (externalUsage && externalUsage.length > 0) {
      return res.status(400).json({ 
        error: 'Gagal menghapus data. Jenis pasien ini masih digunakan di tiket eksternal. Tidak dapat menghapus data yang sudah digunakan.' 
      });
    }

    // Jika tidak digunakan, hapus data
    const { error } = await supabaseAdmin
      .from('patient_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting patient type:', error);
    res.status(500).json({ 
      error: 'Gagal menghapus data jenis pasien',
      details: error.message 
    });
  }
};

// SLA Settings
export const getSLASettings = async (req: Request, res: Response) => {
  try {
    console.log('Fetching SLA settings, path:', req.path);

    const { data, error } = await supabase
      .from('sla_settings')
      .select(`
        *,
        unit_types(name, code),
        service_categories(name, code),
        patient_types(name, code)
      `)
      .order('name');

    if (error) {
      console.error('SLA Settings query error:', error);
      throw error;
    }

    console.log('SLA Settings data fetched:', data?.length || 0, 'records');
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching SLA settings:', error);
    res.status(500).json({ error: 'Failed to fetch SLA settings' });
  }
};

export const createSLASetting = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('sla_settings')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating SLA setting:', error);
    res.status(500).json({ error: 'Failed to create SLA setting' });
  }
};

export const updateSLASetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('sla_settings')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating SLA setting:', error);
    res.status(500).json({ error: 'Failed to update SLA setting' });
  }
};

export const deleteSLASetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('sla_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting SLA setting:', error);
    res.status(500).json({ error: 'Failed to delete SLA setting' });
  }
};

// Roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('roles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

// Response Templates
export const getResponseTemplates = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('response_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching response templates:', error);
    res.status(500).json({ error: 'Failed to fetch response templates' });
  }
};

export const createResponseTemplate = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('response_templates')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating response template:', error);
    res.status(500).json({ error: 'Failed to create response template' });
  }
};

export const updateResponseTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('response_templates')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating response template:', error);
    res.status(500).json({ error: 'Failed to update response template' });
  }
};

export const deleteResponseTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('response_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting response template:', error);
    res.status(500).json({ error: 'Failed to delete response template' });
  }
};

// AI Trust Settings
export const getAITrustSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ai_trust_settings')
      .select('*')
      .order('setting_name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching AI trust settings:', error);
    res.status(500).json({ error: 'Failed to fetch AI trust settings' });
  }
};

export const updateAITrustSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (id) {
      // Update specific setting by ID
      const { data, error } = await supabase
        .from('ai_trust_settings')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // If no ID provided, update the first (default) setting
    const { data: existingData, error: fetchError } = await supabase
      .from('ai_trust_settings')
      .select('*')
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let data;
    if (existingData) {
      // Update existing setting
      const { data: updatedData, error: updateError } = await supabase
        .from('ai_trust_settings')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', existingData.id)
        .select()
        .single();

      if (updateError) throw updateError;
      data = updatedData;
    } else {
      // Create new setting if none exists
      const { data: newData, error: createError } = await supabase
        .from('ai_trust_settings')
        .insert({
          setting_name: 'default',
          ...req.body
        })
        .select()
        .single();

      if (createError) throw createError;
      data = newData;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating AI trust settings:', error);
    res.status(500).json({ error: 'Failed to update AI trust settings' });
  }
};