-- ==========================================================================
-- SARASWATI SHISHU VIDYA MANDIR - CBSE AFFILIATED INSTITUTION
-- Database Migration: Storage Buckets Definition for Supabase Storage
-- ==========================================================================

-- Insert standard school storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('school-documents', 'school-documents', true),
('notices', 'notices', true),
('gallery', 'gallery', true),
('staff', 'staff', true),
('achievements', 'achievements', true),
('calendar', 'calendar', true),
('forms', 'forms', true),
('transfer-certificates', 'transfer-certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public Read for assets, Authenticated Upload/Delete only
CREATE POLICY "Public Read All Storage Buckets" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Admin Upload All Storage Buckets" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update All Storage Buckets" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete All Storage Buckets" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
