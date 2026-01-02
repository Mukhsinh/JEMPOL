-- 1. Update Tabel Unit
ALTER TABLE public.unit 
ADD COLUMN IF NOT EXISTS parent_unit_id UUID REFERENCES public.unit(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_sla INTEGER DEFAULT 24; -- dalam jam

-- 2. Update Tabel Tiket
ALTER TABLE public.tiket
ADD COLUMN IF NOT EXISTS kategori_spesifik TEXT,
ADD COLUMN IF NOT EXISTS sumber_aduan TEXT DEFAULT 'web';

-- 3. Update Tabel Pengguna
ALTER TABLE public.pengguna
ADD COLUMN IF NOT EXISTS nip TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS terakhir_login TIMESTAMP WITH TIME ZONE;

-- 4. Tabel Survei Kepuasan Masyarakat (SKM)
CREATE TABLE IF NOT EXISTS public.survei_kepuasan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenant(id) ON DELETE CASCADE NOT NULL,
    jenis_layanan TEXT NOT NULL, -- rawat_jalan, rawat_inap, dll
    usia TEXT, -- < 20 Th, 20 - 40 Th, dll
    gender TEXT, -- male, female
    nilai_q1 INTEGER,
    nilai_q2 INTEGER,
    nilai_q3 INTEGER,
    nilai_q4 INTEGER,
    nilai_q5 INTEGER,
    nilai_q6 INTEGER,
    nilai_q7 INTEGER,
    nilai_q8 INTEGER,
    kepuasan_total TEXT, -- sangat_puas, puas, dll
    saran TEXT,
    nama_responden TEXT, -- Opsional
    tanggal_survei DATE DEFAULT CURRENT_DATE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Lampiran Tiket
CREATE TABLE IF NOT EXISTS public.tiket_attachment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tiket_id UUID REFERENCES public.tiket(id) ON DELETE CASCADE NOT NULL,
    nama_file TEXT NOT NULL,
    url_file TEXT NOT NULL,
    tipe_file TEXT, -- image/jpeg, application/pdf, dll
    ukuran_file INTEGER, -- dalam bytes
    diunggah_oleh UUID REFERENCES public.pengguna(id) ON DELETE SET NULL,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Pengaturan Notifikasi
CREATE TABLE IF NOT EXISTS public.pengaturan_notifikasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE CASCADE NOT NULL,
    jenis_notifikasi TEXT NOT NULL, -- tiket_baru, eskalasi, sla_warning, respon_baru, tiket_closed
    channel_email BOOLEAN DEFAULT true,
    channel_web BOOLEAN DEFAULT true,
    channel_wa BOOLEAN DEFAULT false,
    UNIQUE(pengguna_id, jenis_notifikasi)
);

-- 7. Tabel Aktivitas Tiket (Timeline yang lebih detail dari sekedar respon)
CREATE TABLE IF NOT EXISTS public.tiket_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tiket_id UUID REFERENCES public.tiket(id) ON DELETE CASCADE NOT NULL,
    pengguna_id UUID REFERENCES public.pengguna(id) ON DELETE SET NULL, -- Bisa null jika sistem/AI
    jenis_aktivitas TEXT NOT NULL, -- created, assigned, status_changed, commented, file_uploaded, sla_warning
    deskripsi TEXT NOT NULL,
    metadata JSONB, -- Simpan detail perubahan (misal: status lama -> status baru)
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies untuk tabel baru

-- Survei: Public bisa insert, Admin bisa view
ALTER TABLE public.survei_kepuasan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Survei insertable by everyone" ON public.survei_kepuasan
    FOR INSERT WITH CHECK (true); -- Public access allowed for submission

CREATE POLICY "Survei viewable by tenant members" ON public.survei_kepuasan
    FOR SELECT USING (
        tenant_id = get_my_tenant_id() OR is_superadmin()
    );

-- Attachment: Sama seperti tiket
ALTER TABLE public.tiket_attachment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attachments viewable by tenant members" ON public.tiket_attachment
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tiket WHERE id = tiket_attachment.tiket_id AND (tenant_id = get_my_tenant_id() OR is_superadmin()))
    );

CREATE POLICY "Attachments insertable by authenticated" ON public.tiket_attachment
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pengaturan Notifikasi: User hanya bisa akses punya sendiri
ALTER TABLE public.pengaturan_notifikasi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification settings viewable by owner" ON public.pengaturan_notifikasi
    FOR SELECT USING (auth.uid() = pengguna_id);

CREATE POLICY "Notification settings updateable by owner" ON public.pengaturan_notifikasi
    FOR UPDATE USING (auth.uid() = pengguna_id);

CREATE POLICY "Notification settings insertable by owner" ON public.pengaturan_notifikasi
    FOR INSERT WITH CHECK (auth.uid() = pengguna_id);

-- Aktivitas Tiket: Sama seperti tiket
ALTER TABLE public.tiket_aktivitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity viewable by tenant members" ON public.tiket_aktivitas
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tiket WHERE id = tiket_aktivitas.tiket_id AND (tenant_id = get_my_tenant_id() OR is_superadmin()))
    );
