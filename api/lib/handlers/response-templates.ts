import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const templateId = req.query.id as string;

    // GET single template by ID
    if (req.method === 'GET' && templateId) {
      const { data: template, error } = await supabase
        .from('response_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          error: 'Template tidak ditemukan',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: template
      });
    }

    // GET - Fetch all templates
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('response_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST - Create new template
    if (req.method === 'POST') {
      const { name, subject, content, category, variables, is_active } = req.body;

      const { data, error } = await supabase
        .from('response_templates')
        .insert([{
          name,
          subject,
          content,
          category,
          variables: variables || [],
          is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Template berhasil dibuat',
        data
      });
    }

    // PUT - Update template
    if (req.method === 'PUT' && templateId) {
      const templateData = req.body;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (templateData.name !== undefined) updateData.name = templateData.name;
      if (templateData.subject !== undefined) updateData.subject = templateData.subject;
      if (templateData.content !== undefined) updateData.content = templateData.content;
      if (templateData.category !== undefined) updateData.category = templateData.category;
      if (templateData.variables !== undefined) updateData.variables = templateData.variables;
      if (templateData.is_active !== undefined) updateData.is_active = templateData.is_active;
      
      const { data: updatedTemplate, error } = await supabase
        .from('response_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Gagal mengupdate template',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedTemplate,
        message: 'Template berhasil diupdate'
      });
    }

    // DELETE - Delete template
    if (req.method === 'DELETE' && templateId) {
      const { error } = await supabase
        .from('response_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus template',
          details: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Template berhasil dihapus'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Error in response-templates API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
