-- SEED DATA

-- 1. Insert Tenant Default
INSERT INTO public.tenant (nama_tenant, kode_tenant, alamat, aktif)
VALUES 
('Pemerintah Kota', 'pemkot', 'Jl. Balai Kota No. 1', true),
('RSUD Sehat Sejahtera', 'rsud-kota', 'Jl. Kesehatan No. 99', true)
ON CONFLICT (kode_tenant) DO NOTHING;

-- 2. Insert Unit untuk Pemkot
WITH t AS (SELECT id FROM public.tenant WHERE kode_tenant = 'pemkot')
INSERT INTO public.unit (tenant_id, nama_unit, kode_unit, jenis_unit)
VALUES 
((SELECT id FROM t), 'Dinas Kesehatan', 'DINKES', 'non_medis'),
((SELECT id FROM t), 'Dinas Pekerjaan Umum', 'PU', 'non_medis'),
((SELECT id FROM t), 'Satpol PP', 'SATPOL', 'non_medis'),
((SELECT id FROM t), 'Pelayanan Terpadu', 'PTSP', 'administrasi')
ON CONFLICT (tenant_id, kode_unit) DO NOTHING;

-- 3. Insert Unit untuk RSUD
WITH t AS (SELECT id FROM public.tenant WHERE kode_tenant = 'rsud-kota')
INSERT INTO public.unit (tenant_id, nama_unit, kode_unit, jenis_unit)
VALUES 
((SELECT id FROM t), 'Instalasi Gawat Darurat', 'IGD', 'medis'),
((SELECT id FROM t), 'Poli Umum', 'POLI-UMUM', 'medis'),
((SELECT id FROM t), 'Poli Anak', 'POLI-ANAK', 'medis'),
((SELECT id FROM t), 'Farmasi', 'FARMASI', 'medis'),
((SELECT id FROM t), 'Kasir & Pendaftaran', 'ADM', 'administrasi')
ON CONFLICT (tenant_id, kode_unit) DO NOTHING;

-- 4. Instruksi Manual untuk Superadmin
-- Setelah user dibuat di Authentication > Users, jalankan query ini untuk menjadikannya Superadmin:
-- UPDATE public.pengguna SET peran = 'superadmin', tenant_id = (SELECT id FROM public.tenant WHERE kode_tenant = 'pemkot') WHERE email = 'admin@pemkot.go.id';
