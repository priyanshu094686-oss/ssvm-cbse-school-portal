-- ==========================================================================
-- SARASWATI SHISHU VIDYA MANDIR - CBSE AFFILIATED INSTITUTION
-- Database Migration: Row Level Security (RLS) for Supabase / PostgreSQL
-- ==========================================================================

-- Enable Row Level Security on all tables
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_general_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE smc_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Published Content
CREATE POLICY "Public can view school settings" ON school_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active principal" ON principals FOR SELECT USING (is_current = true);
CREATE POLICY "Public can view published staff" ON staff FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published notices" ON notices FOR SELECT USING (published = true);
CREATE POLICY "Public can view published calendar" ON academic_calendar FOR SELECT USING (published = true);
CREATE POLICY "Public can view published fees" ON fees FOR SELECT USING (published = true);
CREATE POLICY "Public can view published infrastructure" ON infrastructure FOR SELECT USING (published = true);
CREATE POLICY "Public can view published achievements" ON achievements FOR SELECT USING (published = true);
CREATE POLICY "Public can view published gallery" ON gallery FOR SELECT USING (published = true);
CREATE POLICY "Public can view disclosure general info" ON disclosure_general_information FOR SELECT USING (true);
CREATE POLICY "Public can view published disclosure documents" ON disclosure_documents FOR SELECT USING (published = true);
CREATE POLICY "Public can view published smc members" ON smc_members FOR SELECT USING (published = true);
CREATE POLICY "Public can view published transfer certificates" ON transfer_certificates FOR SELECT USING (published = true);

-- 2. Public Insert Policies for Enquiries (Write-Only, No Public Read)
CREATE POLICY "Public can submit admission enquiry" ON admission_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit contact enquiry" ON contact_enquiries FOR INSERT WITH CHECK (true);

-- 3. Authenticated Staff / Service Role Policies (Full Administrative Access)
CREATE POLICY "Admins full access to school settings" ON school_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to principals" ON principals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to staff" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to notices" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to academic calendar" ON academic_calendar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to fees" ON fees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to infrastructure" ON infrastructure FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to disclosure general info" ON disclosure_general_information FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to disclosure documents" ON disclosure_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to smc members" ON smc_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to transfer certificates" ON transfer_certificates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to admission enquiries" ON admission_enquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to contact enquiries" ON contact_enquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to audit logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to admin users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');
