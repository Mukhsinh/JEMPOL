-- Missing Master Data Tables

-- 1. Unit Types
CREATE TABLE IF NOT EXISTS public.unit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'domain',
    color TEXT DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ticket Statuses
CREATE TABLE IF NOT EXISTS public.ticket_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    status_type TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    color TEXT DEFAULT '#6B7280',
    is_final BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Patient Types
CREATE TABLE IF NOT EXISTS public.patient_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    priority_level INTEGER DEFAULT 1,
    default_sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SLA Settings
CREATE TABLE IF NOT EXISTS public.sla_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    unit_type_id UUID REFERENCES public.unit_types(id) ON DELETE CASCADE,
    service_category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    patient_type_id UUID REFERENCES public.patient_types(id) ON DELETE CASCADE,
    priority_level TEXT DEFAULT 'sedang',
    response_time_hours INTEGER DEFAULT 2,
    resolution_time_hours INTEGER DEFAULT 24,
    escalation_time_hours INTEGER DEFAULT 4,
    business_hours_only BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AI Trust Settings
CREATE TABLE IF NOT EXISTS public.ai_trust_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_name TEXT UNIQUE NOT NULL,
    confidence_threshold FLOAT DEFAULT 0.8,
    auto_routing_enabled BOOLEAN DEFAULT false,
    auto_classification_enabled BOOLEAN DEFAULT false,
    manual_review_required BOOLEAN DEFAULT true,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. QR Code Analytics
CREATE TABLE IF NOT EXISTS public.qr_code_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE NOT NULL,
    scan_date DATE DEFAULT CURRENT_DATE NOT NULL,
    scan_count INTEGER DEFAULT 0,
    ticket_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(qr_code_id, scan_date)
);

-- Enable RLS
ALTER TABLE public.unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trust_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all for authenticated" ON public.unit_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.service_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.ticket_statuses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.patient_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.sla_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.ai_trust_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.qr_code_analytics FOR ALL TO authenticated USING (true);

-- Public Policies (for fallback)
CREATE POLICY "Allow public select" ON public.unit_types FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select" ON public.service_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select" ON public.ticket_statuses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select" ON public.patient_types FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select" ON public.sla_settings FOR SELECT TO anon USING (true);

-- Seed Data

-- Patient Types
INSERT INTO public.patient_types (name, code, description, priority_level, default_sla_hours, is_active)
VALUES 
('Pasien Umum', 'UMUM', 'Pasien dengan layanan umum', 3, 24, true),
('Pasien VIP', 'VIP', 'Pasien dengan layanan VIP', 2, 4, true),
('Pasien Darurat', 'DARURAT', 'Pasien dengan kondisi darurat', 1, 1, true)
ON CONFLICT (code) DO NOTHING;

-- Ticket Statuses
INSERT INTO public.ticket_statuses (name, code, description, status_type, color, is_final, display_order, is_active)
VALUES 
('Baru', 'NEW', 'Tiket baru dibuat', 'open', '#3B82F6', false, 1, true),
('Sedang Diproses', 'IN_PROGRESS', 'Tiket sedang ditangani', 'in_progress', '#F59E0B', false, 2, true),
('Menunggu Respon', 'PENDING', 'Menunggu respon dari pelapor', 'in_progress', '#8B5CF6', false, 3, true),
('Selesai', 'RESOLVED', 'Masalah telah diselesaikan', 'resolved', '#10B981', true, 4, true),
('Ditutup', 'CLOSED', 'Tiket ditutup', 'closed', '#6B7280', true, 5, true)
ON CONFLICT (code) DO NOTHING;

-- Unit Types
INSERT INTO public.unit_types (name, code, description, icon, color, is_active)
VALUES 
('Administratif', 'ADM', 'Unit Administratif', 'business', '#6B7280', true),
('Layanan Medis', 'MED', 'Unit Layanan Medis', 'local_hospital', '#3B82F6', true)
ON CONFLICT (code) DO NOTHING;

-- AI Trust Settings
INSERT INTO public.ai_trust_settings (setting_name, confidence_threshold, auto_routing_enabled, auto_classification_enabled, manual_review_required, description)
VALUES ('default', 0.85, false, true, true, 'Default AI trust configuration')
ON CONFLICT (setting_name) DO NOTHING;
