import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  try {
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }
    
    console.log(`🎯 ${req.method} /api/public/users - Vercel Function`);
    
    // Debug: Log environment variables (hanya untuk troubleshooting)
    console.log('🔍 Environment check:');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    // Initialize Supabase client dengan service role key untuk bypass RLS
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    // Prioritaskan SERVICE_ROLE_KEY untuk operasi admin, fallback ke ANON_KEY jika tidak ada
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
    
    // Debug logging (tanpa expose key)
    console.log('🔑 Key selection:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('   VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('   Is SERVICE_ROLE_KEY used?:', supabaseKey === (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
    console.log('   Selected key length:', supabaseKey ? supabaseKey.length : 0);
    console.log('   Selected key first 20 chars:', supabaseKey ? supabaseKey.substring(0, 20) : 'EMPTY');
    console.log('   Selected key last 20 chars:', supabaseKey ? supabaseKey.substring(supabaseKey.length - 20) : 'EMPTY');
    
    if (!supabaseUrl) {
      console.error('❌ SUPABASE_URL is missing');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi Supabase URL tidak ditemukan. Pastikan SUPABASE_URL sudah diset di Vercel Environment Variables.',
        data: []
      });
    }
    
    if (!supabaseKey) {
      console.error('❌ No Supabase key found');
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi Supabase Key tidak ditemukan. Pastikan SUPABASE_SERVICE_ROLE_KEY atau SUPABASE_ANON_KEY sudah diset di Vercel Environment Variables.',
        data: []
      });
    }
    
    // Validasi format key (JWT harus memiliki 3 bagian yang dipisahkan dengan titik)
    const keyParts = supabaseKey.split('.');
    if (keyParts.length !== 3) {
      console.error('❌ Invalid key format - not a valid JWT. Key parts:', keyParts.length);
      return res.status(500).json({
        success: false,
        error: 'Format Supabase Key tidak valid. Key harus berupa JWT token yang valid.',
        data: []
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
    
    // GET - Fetch all users with relations
    if (req.method === 'GET') {
      const { data: users, error } = await supabase
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
        .order('full_name', { ascending: true });

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(200).json({
          success: false,
          error: 'Gagal mengambil data pengguna',
          details: error.message,
          data: []
        });
      }

      console.log(`✅ Successfully fetched ${users?.length || 0} users`);

      return res.status(200).json({
        success: true,
        data: users || [],
        count: users?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // POST - Create new user
    if (req.method === 'POST') {
      const userData = req.body;
      
      console.log('📝 POST /api/public/users - Request body:', JSON.stringify(userData, null, 2));
      
      // Validasi input - required fields
      if (!userData.full_name || !userData.email) {
        console.error('❌ Validation failed: missing full_name or email');
        return res.status(400).json({
          success: false,
          error: 'Nama lengkap dan email wajib diisi'
        });
      }
      
      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        console.error('❌ Validation failed: invalid email format');
        return res.status(400).json({
          success: false,
          error: 'Format email tidak valid'
        });
      }
      
      // Validasi role jika diberikan
      const validRoles = ['staff', 'supervisor', 'manager', 'director', 'admin'];
      if (userData.role && !validRoles.includes(userData.role)) {
        console.error('❌ Validation failed: invalid role');
        return res.status(400).json({
          success: false,
          error: `Role tidak valid. Gunakan salah satu: ${validRoles.join(', ')}`
        });
      }

      // Cek apakah email sudah ada menggunakan limit(1) untuk menghindari error
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userData.email.toLowerCase())
        .limit(1);

      // Jika error, log dan lanjutkan (jangan block create user)
      if (checkError) {
        console.error('❌ Error checking existing user:', checkError);
        console.error('❌ Error code:', checkError.code);
        console.error('❌ Error message:', checkError.message);
        
        // Jika error terkait auth/permission yang serius, return error
        if (checkError.code === '42501' || checkError.code === 'PGRST301') {
          return res.status(500).json({
            success: false,
            error: 'Konfigurasi database tidak valid. Silakan hubungi administrator.'
          });
        }
        
        // Untuk error lain, log tapi lanjutkan (mungkin RLS issue)
        console.warn('⚠️ Skipping email check due to error, will try to create user anyway');
      }

      // Cek apakah email sudah ada dari hasil query
      if (existingUsers && existingUsers.length > 0) {
        console.error('❌ Email already exists:', userData.email);
        return res.status(400).json({
          success: false,
          error: 'Email sudah terdaftar'
        });
      }
      
      // Jika password diberikan, buat akun admin terlebih dahulu
      let adminId = null;
      if (userData.password && userData.password.trim()) {
        console.log('🔐 Creating admin account for user...');
        
        // 0. Cek apakah email sudah ada di tabel admins
        const { data: existingAdminByEmail } = await supabase
          .from('admins')
          .select('id, email')
          .eq('email', userData.email.toLowerCase().trim())
          .maybeSingle();
        
        if (existingAdminByEmail) {
          console.error('❌ Admin dengan email ini sudah ada:', userData.email);
          return res.status(400).json({
            success: false,
            error: 'Email sudah terdaftar sebagai admin'
          });
        }
        
        // 1. Buat user di Supabase Auth terlebih dahulu
        console.log('📧 Creating Supabase Auth user...');
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email.toLowerCase().trim(),
          password: userData.password.trim(),
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: userData.full_name.trim(),
          }
        });
        
        if (authError) {
          console.error('❌ Error creating Supabase Auth user:', authError);
          return res.status(400).json({
            success: false,
            error: 'Gagal membuat akun auth: ' + authError.message
          });
        }
        
        console.log('✅ Supabase Auth user created:', authUser.user?.id);
        
        // 2. Import bcrypt untuk hash password (untuk tabel admins)
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.default.hash(userData.password, 10);
        
        // 3. Generate username dari email (bagian sebelum @)
        const username = userData.email.split('@')[0].toLowerCase();
        
        // 4. Cek apakah username sudah ada
        const { data: existingAdmin } = await supabase
          .from('admins')
          .select('id, username')
          .eq('username', username)
          .maybeSingle();
        
        let finalUsername = username;
        if (existingAdmin) {
          // Tambahkan timestamp untuk membuat username unik
          finalUsername = `${username}_${Date.now()}`;
          console.log(`⚠️ Username ${username} sudah ada, menggunakan ${finalUsername}`);
        }
        
        // 5. Buat admin account di tabel admins (DENGAN unit_id!)
        const { data: newAdmin, error: adminError } = await supabase
          .from('admins')
          .insert({
            username: finalUsername,
            password_hash: passwordHash,
            full_name: userData.full_name.trim(),
            email: userData.email.toLowerCase().trim(),
            role: 'admin',
            unit_id: userData.unit_id || null, // PERBAIKAN: Tambahkan unit_id
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (adminError) {
          console.error('❌ Error creating admin account:', adminError);
          
          // Rollback: hapus user dari Supabase Auth
          if (authUser?.user?.id) {
            console.log('🗑️ Rolling back Supabase Auth user...');
            await supabase.auth.admin.deleteUser(authUser.user.id);
          }
          
          return res.status(400).json({
            success: false,
            error: 'Gagal membuat akun admin: ' + adminError.message
          });
        }
        
        adminId = newAdmin.id;
        console.log('✅ Admin account created:', finalUsername, adminId);
      }
      
      const insertData = {
        full_name: userData.full_name.trim(),
        email: userData.email.toLowerCase().trim(),
        employee_id: userData.employee_id || null,
        phone: userData.phone || null,
        unit_id: userData.unit_id || null,
        role: userData.role || 'staff',
        admin_id: adminId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting user data:', JSON.stringify(insertData, null, 2));
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert(insertData)
        .select(`
          *,
          units:unit_id (id, name, code),
          admins:admin_id (id, username, email)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        
        // Rollback: hapus admin dan Supabase Auth user jika sudah dibuat
        if (adminId) {
          console.log('🗑️ Rolling back admin account creation...');
          await supabase.from('admins').delete().eq('id', adminId);
          
          // Hapus juga dari Supabase Auth
          console.log('🗑️ Rolling back Supabase Auth user...');
          const { data: adminData } = await supabase
            .from('admins')
            .select('email')
            .eq('id', adminId)
            .maybeSingle();
          
          if (adminData?.email) {
            // Cari user di Supabase Auth berdasarkan email
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const authUser = users?.find(u => u.email === adminData.email);
            if (authUser) {
              await supabase.auth.admin.deleteUser(authUser.id);
            }
          }
        }
        
        return res.status(400).json({
          success: false,
          error: 'Gagal membuat pengguna: ' + error.message,
          details: error
        });
      }

      console.log('✅ User created successfully:', newUser.id, newUser.full_name);
      
      // Jika admin account dibuat, tambahkan info ke response
      let message = 'Pengguna berhasil dibuat';
      if (adminId) {
        message += '. Akun login telah dibuat dan pengguna dapat login dengan email dan password yang diberikan.';
      }

      return res.status(201).json({
        success: true,
        data: newUser,
        message: message,
        login_enabled: !!adminId
      });
    }
    
    // PUT - Update user
    if (req.method === 'PUT') {
      // Ambil userId dari query parameter
      const userId = req.query.id as string;
      
      console.log('✏️ PUT /api/public/users - User ID:', userId);
      console.log('✏️ Query params:', req.query);
      
      if (!userId || userId === 'users') {
        console.error('❌ User ID missing or invalid');
        return res.status(400).json({
          success: false,
          error: 'User ID diperlukan'
        });
      }

      const userData = req.body;
      
      console.log('✏️ Update data:', JSON.stringify(userData, null, 2));
      
      // PERBAIKAN: Ambil data user untuk mendapatkan admin_id
      const { data: existingUser } = await supabase
        .from('users')
        .select('admin_id, email')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          email: userData.email,
          employee_id: userData.employee_id || null,
          phone: userData.phone || null,
          unit_id: userData.unit_id || null,
          role: userData.role,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          updated_at: new Date().toISOString()
        })
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

      // PERBAIKAN: Sinkronkan unit_id ke tabel admins jika user memiliki admin_id
      if (existingUser?.admin_id) {
        console.log('🔄 Syncing unit_id to admins table for admin_id:', existingUser.admin_id);
        const { error: adminUpdateError } = await supabase
          .from('admins')
          .update({
            unit_id: userData.unit_id || null,
            full_name: userData.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.admin_id);
        
        if (adminUpdateError) {
          console.error('⚠️ Warning: Failed to sync unit_id to admins table:', adminUpdateError);
          // Tidak return error karena update user sudah berhasil
        } else {
          console.log('✅ Successfully synced unit_id to admins table');
        }
      }

      console.log('✅ User updated:', userId);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Pengguna berhasil diperbarui'
      });
    }
    
    // DELETE - Delete user (hard delete)
    if (req.method === 'DELETE') {
      // Ambil userId dari query parameter
      const userId = req.query.id as string;
      
      console.log('🗑️ DELETE /api/public/users - User ID:', userId);
      console.log('🗑️ Query params:', req.query);
      console.log('🗑️ Full URL:', req.url);
      
      if (!userId || userId === 'users') {
        console.error('❌ User ID missing or invalid');
        return res.status(400).json({
          success: false,
          error: 'User ID diperlukan'
        });
      }

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

      // Hard delete - hapus permanen dari database menggunakan SERVICE_ROLE_KEY
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return res.status(400).json({
          success: false,
          error: 'Gagal menghapus pengguna: ' + error.message
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
      error: 'Method not allowed'
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(200).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + (error.message || 'Unknown error'),
      data: []
    });
  }
}
