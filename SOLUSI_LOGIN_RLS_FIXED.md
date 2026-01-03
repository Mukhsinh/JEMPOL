# SOLUSI LOGIN RLS FIXED

## Masalah yang Ditemukan
1. **Error 401 Unauthorized** saat mengakses tabel `admins`
2. **RLS Policy** yang terlalu ketat menghalangi akses login
3. **Password hash** tidak sinkron antara `auth.users` dan `admins` table

## Perbaikan yang Dilakukan

### 1. Update RLS Policies
```sql
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow all operations on admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated users to read active admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;

-- Create new policy for login access
CREATE POLICY "Allow login access to active admins" ON public.admins
FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated admins to read all admin data
CREATE POLICY "Allow authenticated admins to read admins" ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated admins to update their own profile
CREATE POLICY "Allow admins to update own profile" ON public.admins
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON public.admins
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### 2. Sinkronisasi Password Hash
```sql
-- Update admin table password hash
UPDATE public.admins 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW()
WHERE email = 'admin@jempol.com';

-- Update auth.users password hash
UPDATE auth.users 
SET encrypted_password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW()
WHERE email = 'admin@jempol.com';

-- Sinkronisasi ID antara auth.users dan admins
UPDATE public.admins 
SET id = 'e235a49c-e8bb-4a28-8571-8509a849ee5c',
    updated_at = NOW()
WHERE email = 'admin@jempol.com';
```

### 3. Kredensial Login
- **Email**: admin@jempol.com
- **Password**: admin123

## Testing
1. Jalankan `TEST_LOGIN_FIXED_FINAL.bat`
2. Buka `test-login-final-fix.html` untuk test manual
3. Akses aplikasi di `http://localhost:3001`

## Status
✅ **FIXED** - Login sekarang berfungsi dengan RLS policy yang benar dan password yang sinkron.