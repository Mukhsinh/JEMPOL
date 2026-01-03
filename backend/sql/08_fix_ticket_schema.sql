-- Fix Ticket Schema for Reports
ALTER TABLE public.tiket
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;

-- Index for reporting
CREATE INDEX IF NOT EXISTS idx_tiket_created_at ON public.tiket(dibuat_pada);
CREATE INDEX IF NOT EXISTS idx_tiket_category_id ON public.tiket(category_id);
