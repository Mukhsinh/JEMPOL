-- 1. Ebook Sections
CREATE TABLE IF NOT EXISTS public.ebook_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional, if settings are per user. If global, remove this.
    type TEXT NOT NULL, -- e.g., 'ticket_created', 'ticket_updated'
    enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, type) -- Ensure one setting per type per user (or just type if global)
);

-- Enable RLS
ALTER TABLE public.ebook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ebook sections viewable by everyone" ON public.ebook_sections
    FOR SELECT USING (true);

CREATE POLICY "Ebook sections manageable by admin" ON public.ebook_sections
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.pengguna WHERE id = auth.uid() AND peran IN ('superadmin', 'admin_tenant'))
    );

CREATE POLICY "Notification settings viewable by owner" ON public.notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notification settings updateable by owner" ON public.notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Notification settings insertable by owner" ON public.notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data for Ebook Sections
INSERT INTO public.ebook_sections (title, content, "order", id)
VALUES 
    ('Gambaran Umum KISS', 'Sistem Keluhan dan Informasi Saran Sehat (KISS) adalah platform digital yang dirancang untuk memfasilitasi komunikasi antara pasien dan penyedia layanan kesehatan.', 1, 'd290f1ee-6c54-4b01-90e6-d701748f0851'),
    ('Alur Teknis', 'Panduan teknis penggunaan sistem KISS meliputi proses registrasi, pengajuan keluhan, tracking status, dan resolusi.', 2, 'd290f1ee-6c54-4b01-90e6-d701748f0852'),
    ('Petunjuk Teknis', 'Petunjuk detail untuk menggunakan setiap fitur dalam sistem KISS, termasuk dashboard, manajemen tiket, dan pelaporan.', 3, 'd290f1ee-6c54-4b01-90e6-d701748f0853')
ON CONFLICT (id) DO NOTHING;
