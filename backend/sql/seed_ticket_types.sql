-- Seed Ticket Types
INSERT INTO public.ticket_types (name, code, description, icon, color, default_priority, default_sla_hours, is_active)
VALUES 
('Insiden', 'INC', 'Gangguan pada layanan yang sedang berjalan', 'error', '#EF4444', 'high', 4, true),
('Permintaan Layanan', 'SR', 'Permintaan untuk layanan baru atau informasi', 'help', '#3B82F6', 'medium', 24, true),
('Masalah', 'PRB', 'Penyebab dasar dari satu atau lebih insiden', 'report_problem', '#F59E0B', 'medium', 48, true),
('Perubahan', 'CHG', 'Penambahan, modifikasi, atau penghapusan layanan', 'change_circle', '#10B981', 'low', 72, true)
ON CONFLICT (code) DO NOTHING;
