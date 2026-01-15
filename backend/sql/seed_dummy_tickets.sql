-- SEED DATA DUMMY TIKET & ESKALASI
-- Jalankan script ini di SQL Editor Supabase untuk mengisi data dummy

-- 1. Ambil ID Tenant & Unit (Asumsi tenant 'pemkot' dan unit 'DINKES' ada dari seed awal)
WITH tenant_data AS (
    SELECT id FROM public.tenant WHERE kode_tenant = 'pemkot' LIMIT 1
),
unit_dinkes AS (
    SELECT id FROM public.unit WHERE kode_unit = 'DINKES' LIMIT 1
),
unit_pu AS (
    SELECT id FROM public.unit WHERE kode_unit = 'PU' LIMIT 1
),
user_admin AS (
    SELECT id FROM auth.users LIMIT 1 -- Ambil user pertama saja sebagai contoh
)

-- 2. Insert Tiket Dummy
INSERT INTO public.tiket (
    tenant_id, 
    nomor_tiket, 
    jenis_tiket, 
    judul, 
    deskripsi, 
    status, 
    prioritas, 
    unit_tujuan_id, 
    pengguna_id, 
    nama_pelapor, 
    dibuat_pada,
    batas_waktu
)
SELECT 
    (SELECT id FROM tenant_data),
    'TIKET-2024-001',
    'pengaduan',
    'Lampu Jalan Mati di Jl. Sudirman',
    'Lampu penerangan jalan umum mati total sepanjang 500 meter, sangat berbahaya di malam hari.',
    'eskalasi',
    'tinggi',
    (SELECT id FROM unit_pu),
    (SELECT id FROM user_admin),
    'Budi Warga',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM tenant_data);

-- 3. Insert Eskalasi Dummy
WITH tiket_baru AS (
    SELECT id, tenant_id, unit_tujuan_id FROM public.tiket WHERE nomor_tiket = 'TIKET-2024-001' LIMIT 1
)
INSERT INTO public.eskalasi (
    tenant_id,
    tiket_id,
    dari_unit_id,
    ke_unit_id,
    alasan,
    dibuat_pada
)
SELECT
    (SELECT tenant_id FROM tiket_baru),
    (SELECT id FROM tiket_baru),
    (SELECT unit_tujuan_id FROM tiket_baru),
    NULL, -- Ke level atas (misal Kepala Dinas / Walikota)
    'Membutuhkan persetujuan anggaran perbaikan segera karena area rawan kecelakaan.',
    NOW()
WHERE EXISTS (SELECT 1 FROM tiket_baru);

-- Tambah 1 lagi tiket kritis
WITH tenant_data AS (
    SELECT id FROM public.tenant WHERE kode_tenant = 'pemkot' LIMIT 1
),
unit_dinkes AS (
    SELECT id FROM public.unit WHERE kode_unit = 'DINKES' LIMIT 1
),
user_admin AS (
    SELECT id FROM auth.users LIMIT 1
)
INSERT INTO public.tiket (
    tenant_id, 
    nomor_tiket, 
    jenis_tiket, 
    judul, 
    deskripsi, 
    status, 
    prioritas, 
    unit_tujuan_id, 
    pengguna_id, 
    nama_pelapor, 
    dibuat_pada,
    batas_waktu
)
SELECT 
    (SELECT id FROM tenant_data),
    'TIKET-2024-002',
    'pengaduan',
    'Wabah Demam Berdarah di RW 05',
    'Sudah ada 5 warga yang masuk RS karena DBD, mohon segera dilakukan fogging.',
    'eskalasi',
    'kritis',
    (SELECT id FROM unit_dinkes),
    (SELECT id FROM user_admin),
    'Ketua RW 05',
    NOW() - INTERVAL '5 hours',
    NOW() + INTERVAL '19 hours'
WHERE EXISTS (SELECT 1 FROM tenant_data);

WITH tiket_baru AS (
    SELECT id, tenant_id, unit_tujuan_id FROM public.tiket WHERE nomor_tiket = 'TIKET-2024-002' LIMIT 1
)
INSERT INTO public.eskalasi (
    tenant_id,
    tiket_id,
    dari_unit_id,
    ke_unit_id,
    alasan,
    dibuat_pada
)
SELECT
    (SELECT tenant_id FROM tiket_baru),
    (SELECT id FROM tiket_baru),
    (SELECT unit_tujuan_id FROM tiket_baru),
    NULL,
    'Situasi darurat kesehatan masyarakat, perlu tindakan cepat.',
    NOW()
WHERE EXISTS (SELECT 1 FROM tiket_baru);
