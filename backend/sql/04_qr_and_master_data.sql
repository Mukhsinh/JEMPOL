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

-- 2. Units (Improved version for QR Management)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    unit_type_id UUID REFERENCES public.unit_types(id) ON DELETE SET NULL,
    parent_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    contact_email TEXT,
    contact_phone TEXT,
    sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QR Codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    token TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. QR Code Analytics
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

-- 5. Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Ticket Types
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'confirmation_number',
    color TEXT DEFAULT '#3B82F6',
    default_priority TEXT DEFAULT 'sedang',
    default_sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Ticket Statuses
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

-- 8. Patient Types
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

-- 9. SLA Settings
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

-- 10. AI Trust Settings
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

-- Seed initial AI Trust Settings
INSERT INTO public.ai_trust_settings (setting_name, confidence_threshold, auto_routing_enabled, auto_classification_enabled, manual_review_required, description)
VALUES ('default', 0.85, false, true, true, 'Default AI trust configuration')
ON CONFLICT (setting_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trust_settings ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (Allow all for authenticated users for now, can be refined later)
CREATE POLICY "Allow all for authenticated" ON public.unit_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.units FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.qr_codes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.qr_code_analytics FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.service_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.ticket_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.ticket_statuses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.patient_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.sla_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.ai_trust_settings FOR ALL TO authenticated USING (true);

-- Public access for QR codes (needed for scanning)
CREATE POLICY "Allow public select for qr_codes" ON public.qr_codes FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow public insert for qr_code_analytics" ON public.qr_code_analytics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update for qr_code_analytics" ON public.qr_code_analytics FOR UPDATE TO anon USING (true);
