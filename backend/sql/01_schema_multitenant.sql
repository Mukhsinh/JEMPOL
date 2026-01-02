-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES (Bahasa Indonesia)
CREATE TYPE tipe_pengguna AS ENUM ('superadmin', 'admin_tenant', 'manager', 'petugas', 'publik');
CREATE TYPE jenis_unit AS ENUM ('medis', 'non_medis', 'administrasi');
CREATE TYPE jenis_tiket AS ENUM ('informasi', 'pengaduan', 'saran', 'kepuasan');
CREATE TYPE status_tiket AS ENUM ('baru', 'diproses', 'eskalasi', 'selesai', 'ditolak');
CREATE TYPE prioritas_tiket AS ENUM ('rendah', 'sedang', 'tinggi', 'kritis');

-- 1. TABEL TENANT (Organisasi/Instansi)
CREATE TABLE public.tenant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tenant TEXT NOT NULL,
    kode_tenant TEXT UNIQUE NOT NULL, -- Slug untuk URL/Identifikasi
    alamat TEXT,
    aktif BOOLEAN DEFAULT true,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL UNIT (Unit Kerja)
CREATE TABLE public.unit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    nama_unit TEXT NOT NULL,
    kode_unit TEXT NOT NULL,
    jenis_unit jenis_unit DEFAULT 'non_medis',
    aktif BOOLEAN DEFAULT true,
    parent_unit_id UUID REFERENCES public.unit(id) ON DELETE SET NULL,
    target_sla INTEGER DEFAULT 24, -- dalam jam
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, kode_unit)
);

-- 3. TABEL PENGGUNA (Profile - Extension dari auth.users)
CREATE TABLE public.pengguna (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE, -- Nullable untuk Superadmin global
    unit_id UUID REFERENCES public.unit(id) ON DELETE SET NULL, -- Nullable untuk admin/publik
    nama_lengkap TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    peran tipe_pengguna DEFAULT 'publik',
    aktif BOOLEAN DEFAULT true,
    avatar_url TEXT,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nip TEXT UNIQUE,
    terakhir_login TIMESTAMP WITH TIME ZONE
);

-- 4. TABEL TIKET (Inti Aplikasi)
CREATE TABLE public.tiket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    nomor_tiket TEXT NOT NULL, -- Format: TIKET-{YYYY}-{SEQ}
    jenis_tiket jenis_tiket NOT NULL,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    kategori_spesifik TEXT,
    sumber_aduan TEXT DEFAULT 'web',
    status status_tiket DEFAULT 'baru',
    prioritas prioritas_tiket DEFAULT 'sedang',
    unit_tujuan_id UUID REFERENCES public.unit(id) ON DELETE SET NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE SET NULL, -- Nullable (bisa anonim/publik tanpa login)
    nama_pelapor TEXT, -- Diisi jika pengguna_id null
    kontak_pelapor TEXT, -- Email/HP pelapor
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    selesai_pada TIMESTAMP WITH TIME ZONE,
    batas_waktu TIMESTAMP WITH TIME ZONE, -- SLA Deadline
    UNIQUE(tenant_id, nomor_tiket)
);

-- 5. TABEL ESKALASI
CREATE TABLE public.eskalasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    tiket_id UUID REFERENCES public.tiket(id) ON DELETE CASCADE NOT NULL,
    dari_unit_id UUID REFERENCES public.unit(id) ON DELETE SET NULL,
    ke_unit_id UUID REFERENCES public.unit(id) ON DELETE SET NULL,
    alasan TEXT NOT NULL,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE SET NULL -- Siapa yang mengeskalasi
);

-- 6. TABEL RESPON (Komentar/Balasan)
CREATE TABLE public.respon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    tiket_id UUID REFERENCES public.tiket(id) ON DELETE CASCADE NOT NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE SET NULL,
    isi_respon TEXT NOT NULL,
    jenis_respon TEXT DEFAULT 'publik', -- 'publik' (terlihat pelapor) atau 'internal' (catatan staf)
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL NOTIFIKASI
CREATE TABLE public.notifikasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE CASCADE NOT NULL,
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    dibaca BOOLEAN DEFAULT false,
    tautan TEXT, -- Link ke tiket/halaman terkait
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL QR CODE (Akses Publik)
CREATE TABLE public.qr_unit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    unit_id UUID REFERENCES public.unit(id) ON DELETE CASCADE NOT NULL,
    kode_qr TEXT UNIQUE NOT NULL,
    label_lokasi TEXT,
    aktif BOOLEAN DEFAULT true,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABEL LOG AKTIVITAS (Audit Trail)
CREATE TABLE public.log_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE SET NULL,
    aksi TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, dll
    target_tabel TEXT,
    target_id UUID,
    keterangan TEXT,
    metadata JSONB, -- Data detail perubahan
    waktu TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXING
CREATE INDEX idx_tenant_kode ON public.tenant(kode_tenant);
CREATE INDEX idx_pengguna_tenant ON public.pengguna(tenant_id);
CREATE INDEX idx_pengguna_email ON public.pengguna(email);
CREATE INDEX idx_tiket_tenant ON public.tiket(tenant_id);
CREATE INDEX idx_tiket_unit ON public.tiket(unit_tujuan_id);
CREATE INDEX idx_tiket_status ON public.tiket(status);
CREATE INDEX idx_tiket_nomor ON public.tiket(nomor_tiket);

-- ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eskalasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Current User Tenant ID
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.pengguna WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Is Superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.pengguna WHERE id = auth.uid() AND peran = 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- 1. Tenant
-- Superadmin bisa lihat semua, User biasa hanya tenant sendiri
CREATE POLICY "Tenant viewable by members" ON public.tenant
    FOR SELECT USING (
        id = get_my_tenant_id() OR is_superadmin()
    );

-- 2. Unit
CREATE POLICY "Units viewable by tenant members" ON public.unit
    FOR SELECT USING (
        tenant_id = get_my_tenant_id() OR is_superadmin()
    );

-- 3. Pengguna
CREATE POLICY "Users viewable by tenant members" ON public.pengguna
    FOR SELECT USING (
        tenant_id = get_my_tenant_id() OR is_superadmin()
    );
    
CREATE POLICY "Users updateable by self or admin" ON public.pengguna
    FOR UPDATE USING (
        id = auth.uid() OR 
        (tenant_id = get_my_tenant_id() AND (SELECT peran FROM public.pengguna WHERE id = auth.uid()) IN ('admin_tenant', 'superadmin'))
    );

-- 4. Tiket
-- Select: Tenant members can see tickets. Public can see own tickets (if logged in) or nothing (if anon - handled by app logic usually, or by token)
CREATE POLICY "Tickets viewable by tenant members" ON public.tiket
    FOR SELECT USING (
        tenant_id = get_my_tenant_id() OR is_superadmin()
    );

-- Insert: Authenticated users can create tickets. Public/Anon needs special handling (usually service role or specific anon policy if Supabase Auth Anon is used)
-- Assuming 'public' role in 'pengguna' table means registered public user.
CREATE POLICY "Tickets insertable by everyone" ON public.tiket
    FOR INSERT WITH CHECK (
        -- Jika user login, tenant_id harus match (atau null jika public global - tapi kita wajibkan tenant_id)
        -- Untuk public anonim, biasanya via Edge Function dengan Service Role, atau policy 'anon' role supabase.
        -- Disini kita asumsikan insert via authenticated user (termasuk public user yg login)
        auth.role() = 'authenticated'
    );

CREATE POLICY "Tickets updateable by staff" ON public.tiket
    FOR UPDATE USING (
        tenant_id = get_my_tenant_id() AND 
        (SELECT peran FROM public.pengguna WHERE id = auth.uid()) IN ('admin_tenant', 'manager', 'petugas', 'superadmin')
    );

-- 5. Eskalasi & Respon
CREATE POLICY "Escalations viewable by tenant members" ON public.eskalasi
    FOR SELECT USING (tenant_id = get_my_tenant_id() OR is_superadmin());

CREATE POLICY "Responses viewable by tenant members" ON public.respon
    FOR SELECT USING (tenant_id = get_my_tenant_id() OR is_superadmin());

-- FUNCTIONS & TRIGGERS

-- Auto-generate Nomor Tiket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    seq INTEGER;
    year TEXT;
    prefix TEXT;
BEGIN
    year := to_char(now(), 'YYYY');
    -- Ambil kode tenant atau default
    -- Kita pakai format TIKET-{YYYY}-{SEQ} per tenant
    
    -- Lock table untuk sequence safety (opsional, tergantung load)
    -- Simple approach: count existing tickets for this tenant this year + 1
    -- Better approach: Separate sequence table per tenant. For simplicity here:
    
    SELECT count(*) + 1 INTO seq 
    FROM public.tiket 
    WHERE tenant_id = NEW.tenant_id 
    AND to_char(dibuat_pada, 'YYYY') = year;
    
    NEW.nomor_tiket := 'TIKET-' || year || '-' || lpad(seq::text, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON public.tiket
    FOR EACH ROW
    WHEN (NEW.nomor_tiket IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- Auto-create Profile on Signup (Supabase Auth Hook)
-- Note: Ini biasanya diset di dashboard supabase sebagai trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pengguna (id, email, nama_lengkap, peran)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'publik');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users (harus dijalankan manual di SQL editor supabase jika tidak via migration tool)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
