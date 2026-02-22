import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    // Extract user ID from path parameter
    const userId = req.query.id as string;
    
    console.log(`🎯 ${req.method} /api/public/users/${userId} - Vercel Function`);
    console.log('📋 Query params:', req.query);
    
    // Validate user ID
    if (!userId || userId === 'users' || userId.trim() === '') {
      console.error('❌ User ID missing or invalid');
      return res.status(400).json({
        success: false,
        error: 'User ID diperlukan dan harus valid'
      });
    }
    
    // Initialize Supabase client dengan service role key untuk bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    // Prioritaskan SERVICE_ROLE_KEY untuk operasi admin, fallback ke ANON_KEY jika tidak ada
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      console.error('❌ SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
      console.error('❌ SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi Supabase tidak lengkap'
      });
    }
    
    // Log warning jika menggunakan anon key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Using ANON_KEY instead of SERVICE_ROLE_KEY. Some operations may fail due to RLS policies.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // GET - Fetch user by ID
    if (req.method === 'GET') {
      console.log(`🔍 GET user by ID: ${userId}`);
      
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          units:unit_id (
            id,
            name,
            code,
            is_active
          ),
          admins:admin_id (
            id,
            username,
            full_name,
            email
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', error);
        
        // Check if user not found
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Pengguna tidak ditemukan'
          });
        }
        
        return res.status(400).json({
          success: false,
          error: 'Gagal mengambil data pengguna: ' + error.message,
          details: error
        });
      }

      console.log(`✅ Successfully fetched user: ${user.full_name}`);

      return res.status(200).json({
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      });
    }
    
    // PUT - Update user
    if (req.method === 'PUT') {
      console.log(`✏️ PUT update user: ${userId}`);
      
      const userData = req.body;
      
      console.log('✏️ Update data:', JSON.stringify(userData, null, 2));
      
      // Validasi input
      if (!userData || Object.keys(userData).length === 0) {
        console.error('❌ No update data provided');
        return res.status(400).json({
          success: false,
          error: 'Data update tidak boleh kosong'
        });
      }
      
      // Cek apakah user ada dan ambil admin_id
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, admin_id, full_name')
        .eq('id', userId)
        .single();

      if (checkError || !existingUser) {
        console.error('❌ User not found:', userId, checkError);
        return res.status(404).json({
          success: false,
          error: 'Pengguna tidak ditemukan'
        });
      }
      
      // Build update object - deklarasi di awal
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Jika password diberikan, update password admin
      if (userData.password && userData.password.trim()) {
        console.log('🔐 Updating admin password...');
        
        if (existingUser.admin_id) {
          // Update password admin yang sudah ada
          const bcrypt = await import('bcryptjs');
          const passwordHash = await bcrypt.default.hash(userData.password, 10);
          
          const { error: adminError } = await supabase
            .from('admins')
            .update({
              password_hash: passwordHash,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.admin_id);
          
          if (adminError) {
            console.error('❌ Error updating admin password:', adminError);
            return res.status(400).json({
              success: false,
              error: 'Gagal memperbarui password: ' + adminError.message
            });
          }
          
          console.log('✅ Admin password updated');
        } else {
          // Buat admin account baru jika belum ada
          console.log('🔐 Creating new admin account...');
          
          const bcrypt = await import('bcryptjs');
          const passwordHash = await bcrypt.default.hash(userData.password, 10);
          
          // Generate username dari email
          const email = userData.email || existingUser.email;
          const username = email.split('@')[0].toLowerCase();
          
          // Cek apakah username sudah ada
          const { data: existingAdmin } = await supabase
            .from('admins')
            .select('id, username')
            .eq('username', username)
            .maybeSingle();
          
          let finalUsername = username;
          if (existingAdmin) {
            finalUsername = `${username}_${Date.now()}`;
            console.log(`⚠️ Username ${username} sudah ada, menggunakan ${finalUsername}`);
          }
          
          // Buat admin account
          const { data: newAdmin, error: adminError } = await supabase
            .from('admins')
            .insert({
              username: finalUsername,
              password_hash: passwordHash,
              full_name: userData.full_name || existingUser.full_name,
              email: email,
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();
          
          if (adminError) {
            console.error('❌ Error creating admin account:', adminError);
            return res.status(400).json({
              success: false,
              error: 'Gagal membuat akun admin: ' + adminError.message
            });
          }
          
          // Update user dengan admin_id baru
          updateData.admin_id = newAdmin.id;
          console.log('✅ Admin account created:', finalUsername, newAdmin.id);
        }
      }
      
      // Jika email diubah, cek apakah email baru sudah digunakan
      if (userData.email && userData.email.toLowerCase() !== existingUser.email.toLowerCase()) {
        const { data: emailExists, error: emailCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('email', userData.email.toLowerCase())
          .neq('id', userId)
          .single();

        if (emailCheckError && emailCheckError.code !== 'PGRST116') {
          console.error('❌ Error checking email:', emailCheckError);
          return res.status(400).json({
            success: false,
            error: 'Gagal memeriksa email: ' + emailCheckError.message
          });
        }

        if (emailExists) {
          console.error('❌ Email already exists:', userData.email);
          return res.status(400).json({
            success: false,
            error: 'Email sudah terdaftar'
          });
        }
        
        // Jika ada admin account, update email admin juga
        if (existingUser.admin_id) {
          await supabase
            .from('admins')
            .update({
              email: userData.email.toLowerCase(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.admin_id);
        }
      }
      
      // Populate update data dengan field yang diberikan
      if (userData.full_name !== undefined) updateData.full_name = userData.full_name;
      if (userData.email !== undefined) updateData.email = userData.email.toLowerCase();
      if (userData.employee_id !== undefined) updateData.employee_id = userData.employee_id || null;
      if (userData.phone !== undefined) updateData.phone = userData.phone || null;
      if (userData.unit_id !== undefined) updateData.unit_id = userData.unit_id || null;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.is_active !== undefined) updateData.is_active = userData.is_active;
      
      console.log('✏️ Final update data:', JSON.stringify(updateData, null, 2));
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select(`
          *,
          units:unit_id (id, name, code)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal memperbarui pengguna: ' + error.message,
          details: error
        });
      }

      console.log('✅ User updated successfully:', userId, updatedUser.full_name);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Pengguna berhasil diperbarui'
      });
    }
    
    // DELETE - Delete user (hard delete)
    if (req.method === 'DELETE') {
      console.log(`🗑️ DELETE user: ${userId}`);
      
      // Cek apakah user ada
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, full_name, email, admin_id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking user:', checkError);
        return res.status(400).json({
          success: false,
          error: 'Gagal memeriksa pengguna: ' + checkError.message
        });
      }

      if (!existingUser) {
        console.error('❌ User not found:', userId);
        return res.status(404).json({
          success: false,
          error: 'Pengguna tidak ditemukan'
        });
      }

      console.log('🗑️ Attempting to delete user:', existingUser.full_name, existingUser.email);

      // Jika user memiliki admin account, hapus admin account terlebih dahulu
      if (existingUser.admin_id) {
        console.log('🗑️ Deleting associated admin account:', existingUser.admin_id);
        
        const { error: adminError } = await supabase
          .from('admins')
          .delete()
          .eq('id', existingUser.admin_id);
        
        if (adminError) {
          console.error('❌ Error deleting admin account:', adminError);
          // Lanjutkan menghapus user meskipun gagal menghapus admin
          console.warn('⚠️ Continuing with user deletion despite admin deletion failure');
        } else {
          console.log('✅ Admin account deleted successfully');
        }
      }

      // Hard delete - hapus permanen dari database menggunakan SERVICE_ROLE_KEY
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus pengguna: ' + error.message,
          details: error
        });
      }

      console.log('✅ User deleted successfully:', userId, existingUser.full_name);

      return res.status(200).json({
        success: true,
        message: 'Pengguna berhasil dihapus',
        deleted_user: {
          id: existingUser.id,
          name: existingUser.full_name,
          email: existingUser.email
        }
      });
    }
    
    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Gunakan GET, PUT, atau DELETE'
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error')
    });
  }
}
