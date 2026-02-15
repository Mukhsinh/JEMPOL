-- ============================================
-- FIX RLS POLICY untuk tabel qr_codes
-- ============================================
-- Masalah: INSERT dan DELETE tidak diizinkan oleh RLS policy
-- Solusi: Tambahkan policy yang mengizinkan operasi CRUD untuk anon role

-- 1. Drop existing policies (jika ada)
DROP POLICY IF EXISTS "Enable read access for all users" ON qr_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON qr_codes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON qr_codes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON qr_codes;
DROP POLICY IF EXISTS "Allow all operations for anon" ON qr_codes;

-- 2. Pastikan RLS enabled
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy baru yang mengizinkan semua operasi untuk anon role
-- Policy ini diperlukan karena aplikasi menggunakan anon key untuk operasi CRUD

-- Policy untuk SELECT (read)
CREATE POLICY "Enable read access for all users"
ON qr_codes FOR SELECT
TO anon, authenticated
USING (true);

-- Policy untuk INSERT (create)
CREATE POLICY "Enable insert for all users"
ON qr_codes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy untuk UPDATE (update)
CREATE POLICY "Enable update for all users"
ON qr_codes FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy untuk DELETE (delete)
CREATE POLICY "Enable delete for all users"
ON qr_codes FOR DELETE
TO anon, authenticated
USING (true);

-- 4. Verifikasi policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'qr_codes'
ORDER BY policyname;

-- ============================================
-- CATATAN KEAMANAN:
-- ============================================
-- Policy ini mengizinkan semua operasi untuk anon role.
-- Jika Anda ingin membatasi akses, Anda bisa:
-- 1. Menambahkan kondisi WHERE pada USING clause
-- 2. Menggunakan authenticated role saja (bukan anon)
-- 3. Menambahkan validasi berdasarkan user_id atau role
--
-- Contoh policy yang lebih ketat:
-- CREATE POLICY "Enable insert for authenticated users only"
-- ON qr_codes FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() IS NOT NULL);
