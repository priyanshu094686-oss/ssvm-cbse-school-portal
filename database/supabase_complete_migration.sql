-- ==========================================================================
-- SARASWATI SHISHU VIDYA MANDIR - CBSE AFFILIATED INSTITUTION
-- Complete Production Database Migration & Seed for Supabase
-- ==========================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.school_settings (
    id VARCHAR(64) PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    affiliation_number VARCHAR(128) NOT NULL,
    school_code VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    pin_code VARCHAR(32) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(128) NOT NULL,
    alt_phone VARCHAR(128),
    website VARCHAR(255),
    office_hours VARCHAR(255),
    principal_name VARCHAR(255) NOT NULL,
    principal_qualification VARCHAR(255) NOT NULL,
    principal_message TEXT,
    board VARCHAR(255) NOT NULL,
    classes VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.principals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    message TEXT,
    photo_url VARCHAR(512),
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.staff (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    staff_type VARCHAR(64) NOT NULL CHECK (staff_type IN ('Principal', 'Teaching Staff', 'Administrative Staff', 'Support Staff')),
    designation VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    qualification VARCHAR(255) NOT NULL,
    experience VARCHAR(128),
    photo_url VARCHAR(512),
    bio TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notices (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('General', 'Academic', 'Examination', 'Admission', 'Holiday', 'Events', 'CBSE', 'Important')),
    description TEXT NOT NULL,
    document_url VARCHAR(512),
    notice_date DATE NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id VARCHAR(64) PRIMARY KEY,
    academic_session VARCHAR(64) NOT NULL,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN ('Academic', 'Examination', 'Holiday', 'Events', 'Celebrations', 'Board Exam')),
    event_date VARCHAR(128) NOT NULL,
    end_date VARCHAR(128),
    document_url VARCHAR(512),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.fees (
    id VARCHAR(64) PRIMARY KEY,
    academic_session VARCHAR(64) NOT NULL,
    class_name VARCHAR(128) NOT NULL,
    admission_fee VARCHAR(128) NOT NULL,
    tuition_fee VARCHAR(128) NOT NULL,
    annual_charges VARCHAR(128) NOT NULL,
    other_charges VARCHAR(128),
    payment_frequency VARCHAR(64) DEFAULT 'Quarterly',
    notes TEXT,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.infrastructure (
    id VARCHAR(64) PRIMARY KEY,
    facility_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(512),
    available VARCHAR(128) NOT NULL,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Academic Results', 'Class X Results', 'Student Achievements', 'Sports Achievements', 'Competition Achievements', 'School Achievements')),
    description TEXT NOT NULL,
    achievement_date VARCHAR(128),
    image_url VARCHAR(512),
    document_url VARCHAR(512),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.gallery (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Campus', 'Classrooms', 'Sports', 'Events', 'Cultural Activities', 'Competitions', 'Celebrations', 'Assembly', 'Lab')),
    image_url VARCHAR(512) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    event_date VARCHAR(128),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.disclosure_general_information (
    id VARCHAR(64) PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    affiliation_number VARCHAR(128) NOT NULL,
    school_code VARCHAR(128) NOT NULL,
    complete_address TEXT NOT NULL,
    pin_code VARCHAR(32) NOT NULL,
    principal_name VARCHAR(255) NOT NULL,
    principal_qualification VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(128) NOT NULL,
    last_updated VARCHAR(128),
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.disclosure_documents (
    id VARCHAR(64) PRIMARY KEY,
    document_name VARCHAR(512) NOT NULL,
    category VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(255) NOT NULL,
    status_code VARCHAR(64) DEFAULT 'pending' CHECK (status_code IN ('available', 'pending', 'expired', 'under_verification')),
    issue_date VARCHAR(128),
    validity_date VARCHAR(128),
    last_updated VARCHAR(128),
    file_url VARCHAR(512),
    file_name VARCHAR(255),
    file_type VARCHAR(64) DEFAULT 'PDF',
    file_size VARCHAR(64),
    verified BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.smc_members (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    other_information TEXT,
    photo_url VARCHAR(512),
    published BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.transfer_certificates (
    id VARCHAR(64) PRIMARY KEY,
    tc_number VARCHAR(128) NOT NULL,
    admission_number VARCHAR(128) NOT NULL,
    student_initials VARCHAR(128) NOT NULL,
    class_left VARCHAR(64) NOT NULL,
    issue_date VARCHAR(64) NOT NULL,
    reason VARCHAR(255),
    document_url VARCHAR(512),
    verification_status VARCHAR(128) DEFAULT 'Verified & Issued by School Office',
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.admission_enquiries (
    id VARCHAR(64) PRIMARY KEY,
    ref_number VARCHAR(64) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    class_applying_for VARCHAR(64) NOT NULL,
    parent_guardian_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    message TEXT,
    status VARCHAR(64) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Resolved', 'Archived')),
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Resolved', 'Archived')),
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_user_id VARCHAR(64),
    admin_user_email VARCHAR(255),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    old_data TEXT,
    new_data TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_staff_type ON public.staff(staff_type);
CREATE INDEX IF NOT EXISTS idx_staff_published ON public.staff(is_published);
CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(published, notice_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);
CREATE INDEX IF NOT EXISTS idx_calendar_published ON public.academic_calendar(published);
CREATE INDEX IF NOT EXISTS idx_fees_published ON public.fees(published);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_tc_number ON public.transfer_certificates(tc_number);
CREATE INDEX IF NOT EXISTS idx_tc_admission ON public.transfer_certificates(admission_number);
CREATE INDEX IF NOT EXISTS idx_disclosure_docs_category ON public.disclosure_documents(category);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- 3. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disclosure_general_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disclosure_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smc_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Drop Existing Policies before recreating (for clean re-runs)
DROP POLICY IF EXISTS "Public can view school settings" ON public.school_settings;
DROP POLICY IF EXISTS "Public can view active principal" ON public.principals;
DROP POLICY IF EXISTS "Public can view published staff" ON public.staff;
DROP POLICY IF EXISTS "Public can view published notices" ON public.notices;
DROP POLICY IF EXISTS "Public can view published calendar" ON public.academic_calendar;
DROP POLICY IF EXISTS "Public can view published fees" ON public.fees;
DROP POLICY IF EXISTS "Public can view published infrastructure" ON public.infrastructure;
DROP POLICY IF EXISTS "Public can view published achievements" ON public.achievements;
DROP POLICY IF EXISTS "Public can view published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public can view disclosure general info" ON public.disclosure_general_information;
DROP POLICY IF EXISTS "Public can view published disclosure documents" ON public.disclosure_documents;
DROP POLICY IF EXISTS "Public can view published smc members" ON public.smc_members;
DROP POLICY IF EXISTS "Public can view published transfer certificates" ON public.transfer_certificates;
DROP POLICY IF EXISTS "Public can submit admission enquiry" ON public.admission_enquiries;
DROP POLICY IF EXISTS "Public can submit contact enquiry" ON public.contact_enquiries;

-- 5. Public Read Policies for Published Content
CREATE POLICY "Public can view school settings" ON public.school_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active principal" ON public.principals FOR SELECT USING (is_current = true);
CREATE POLICY "Public can view published staff" ON public.staff FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published notices" ON public.notices FOR SELECT USING (published = true);
CREATE POLICY "Public can view published calendar" ON public.academic_calendar FOR SELECT USING (published = true);
CREATE POLICY "Public can view published fees" ON public.fees FOR SELECT USING (published = true);
CREATE POLICY "Public can view published infrastructure" ON public.infrastructure FOR SELECT USING (published = true);
CREATE POLICY "Public can view published achievements" ON public.achievements FOR SELECT USING (published = true);
CREATE POLICY "Public can view published gallery" ON public.gallery FOR SELECT USING (published = true);
CREATE POLICY "Public can view disclosure general info" ON public.disclosure_general_information FOR SELECT USING (true);
CREATE POLICY "Public can view published disclosure documents" ON public.disclosure_documents FOR SELECT USING (published = true);
CREATE POLICY "Public can view published smc members" ON public.smc_members FOR SELECT USING (published = true);
CREATE POLICY "Public can view published transfer certificates" ON public.transfer_certificates FOR SELECT USING (published = true);

-- 6. Public Write-Only Policies for Form Submissions (Enquiries)
CREATE POLICY "Public can submit admission enquiry" ON public.admission_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit contact enquiry" ON public.contact_enquiries FOR INSERT WITH CHECK (true);

-- 7. Service Role & Authenticated Admins Full Access Policies
CREATE POLICY "Service Role full access to school_settings" ON public.school_settings FOR ALL USING (true);
CREATE POLICY "Service Role full access to principals" ON public.principals FOR ALL USING (true);
CREATE POLICY "Service Role full access to staff" ON public.staff FOR ALL USING (true);
CREATE POLICY "Service Role full access to notices" ON public.notices FOR ALL USING (true);
CREATE POLICY "Service Role full access to academic_calendar" ON public.academic_calendar FOR ALL USING (true);
CREATE POLICY "Service Role full access to fees" ON public.fees FOR ALL USING (true);
CREATE POLICY "Service Role full access to infrastructure" ON public.infrastructure FOR ALL USING (true);
CREATE POLICY "Service Role full access to achievements" ON public.achievements FOR ALL USING (true);
CREATE POLICY "Service Role full access to gallery" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Service Role full access to disclosure_general_information" ON public.disclosure_general_information FOR ALL USING (true);
CREATE POLICY "Service Role full access to disclosure_documents" ON public.disclosure_documents FOR ALL USING (true);
CREATE POLICY "Service Role full access to smc_members" ON public.smc_members FOR ALL USING (true);
CREATE POLICY "Service Role full access to transfer_certificates" ON public.transfer_certificates FOR ALL USING (true);
CREATE POLICY "Service Role full access to admission_enquiries" ON public.admission_enquiries FOR ALL USING (true);
CREATE POLICY "Service Role full access to contact_enquiries" ON public.contact_enquiries FOR ALL USING (true);
CREATE POLICY "Service Role full access to audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Service Role full access to admin_users" ON public.admin_users FOR ALL USING (true);

-- 8. Seed Initial Data with Official Placeholders
INSERT INTO public.admin_users (id, email, password_hash, full_name, role)
VALUES 
('usr-super-admin-01', 'admin@ssvm.edu.in', '$2a$10$Q7sKxWjV3f4P5rS/T7/57.9cOz/tA2fJ9F0xU3L12345678901234', 'School Super Administrator', 'SUPER_ADMIN'),
('usr-editor-02', 'editor@ssvm.edu.in', '$2a$10$Q7sKxWjV3f4P5rS/T7/57.9cOz/tA2fJ9F0xU3L12345678901234', 'Academic Content Editor', 'EDITOR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.school_settings (id, school_name, affiliation_number, school_code, address, pin_code, official_email, official_phone, principal_name, principal_qualification, principal_message, board, classes)
VALUES
('settings-ssvm-01', 'Saraswati Shishu Vidya Mandir', '[OFFICIAL CBSE AFFILIATION NUMBER]', '[OFFICIAL SCHOOL CODE]', '[OFFICIAL SCHOOL ADDRESS]', '[PIN CODE]', '[OFFICIAL SCHOOL EMAIL]', '[OFFICIAL PHONE NUMBER]', '[PRINCIPAL NAME]', '[PRINCIPAL QUALIFICATION]', 'Welcome to Saraswati Shishu Vidya Mandir. Our institution is dedicated to imparting holistic education rooted in timeless cultural values while embracing modern pedagogical standards prescribed by the Central Board of Secondary Education (CBSE).', 'Central Board of Secondary Education (CBSE), New Delhi', 'Classes 1 to 10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.principals (id, name, qualification, designation, message, photo_url, is_current)
VALUES
('principal-01', '[PRINCIPAL NAME]', '[PRINCIPAL QUALIFICATION]', 'Principal', 'Education is the harmonious manifestation of perfection already in human beings.', 'assets/images/logo.jpg', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.disclosure_general_information (id, school_name, affiliation_number, school_code, complete_address, pin_code, principal_name, principal_qualification, official_email, official_phone, last_updated, verified)
VALUES
('gen-info-01', 'Saraswati Shishu Vidya Mandir', '[OFFICIAL CBSE AFFILIATION NUMBER]', '[OFFICIAL SCHOOL CODE]', '[OFFICIAL SCHOOL ADDRESS]', '[PIN CODE]', '[PRINCIPAL NAME]', '[PRINCIPAL QUALIFICATION]', '[OFFICIAL SCHOOL EMAIL]', '[OFFICIAL PHONE NUMBER]', '2026-09-25', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.disclosure_documents (id, document_name, category, description, status, status_code, issue_date, validity_date, file_type, file_size, published)
VALUES
('doc-1', 'CBSE Affiliation / Upgradation Letter & Recent Extension', '1. AFFILIATION / UPGRADATION', 'Copy of initial affiliation and subsequent extension of affiliation letter issued by CBSE.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-2', 'Society / Trust Registration & Renewal Certificate', '2. SOCIETY / TRUST / COMPANY', 'Copies of registration and renewal certificates of the Society/Trust running the school.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-3', 'No Objection Certificate (NOC) Issued by State Govt. / UT', '3. NOC', 'Official NOC issued by the State School Education Department.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-4', 'Recognition Certificate under RTE Act, 2009 & Renewals', '4. RTE RECOGNITION', 'Copy of recognition certificate under Right to Education (RTE) Act 2009.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-5', 'Valid Building Safety Certificate', '5. BUILDING SAFETY', 'Certificate issued by the Competent Government Authority (PWD / Municipal Engineer) ensuring structural safety as per National Building Code.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-6', 'Valid Fire Safety Certificate', '6. FIRE SAFETY', 'Fire safety certificate issued by the Chief Fire Officer / Competent State Fire Service Authority.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-7', 'DEO Certificate / Self-Certification for Affiliation', '7. DEO CERTIFICATE', 'District Education Officer certificate or prescribed self-certification submitted by the school for CBSE affiliation.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true),
('doc-8', 'Valid Water, Health and Sanitation Certificates', '8. WATER / HEALTH / SANITATION', 'Potable drinking water test report and sanitary hygiene compliance certificate issued by Public Health Engineering Dept. / Municipal Health Officer.', 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.', 'pending', '[OFFICIAL ISSUE DATE]', '[OFFICIAL VALIDITY PERIOD]', 'PDF', 'To be uploaded', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff (id, name, staff_type, designation, subject, qualification, experience, photo_url, bio, is_published, sort_order)
VALUES
('fac-1', '[PRINCIPAL NAME]', 'Principal', 'Principal & Head of Institution', 'Administration & Leadership', '[PRINCIPAL QUALIFICATION]', '[OFFICIAL EXPERIENCE]', 'assets/images/logo.jpg', 'Head of institution responsible for academic administration and CBSE compliance.', true, 1),
('fac-2', '[TEACHER NAME]', 'Teaching Staff', 'TGT Mathematics', 'Mathematics (Classes 9–10)', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Secondary Wing Mathematics Faculty', true, 2),
('fac-3', '[TEACHER NAME]', 'Teaching Staff', 'TGT Science', 'Physics & Chemistry (Classes 9–10)', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Secondary Wing Science Faculty', true, 3),
('fac-4', '[TEACHER NAME]', 'Teaching Staff', 'TGT Social Science', 'History & Civics (Classes 6–8)', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Middle Wing Social Science Faculty', true, 4),
('fac-5', '[TEACHER NAME]', 'Teaching Staff', 'TGT Hindi & Sanskrit', 'Hindi & Sanskrit Literature', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Middle Wing Languages Faculty', true, 5),
('fac-6', '[TEACHER NAME]', 'Teaching Staff', 'PRT Primary Teacher', 'English & Environmental Studies', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Primary Wing Teacher', true, 6),
('fac-7', '[TEACHER NAME]', 'Teaching Staff', 'PRT Primary Teacher', 'General Mathematics & Hindi', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Primary Wing Teacher', true, 7),
('fac-8', '[TEACHER NAME]', 'Teaching Staff', 'Physical Education Teacher (PET)', 'Physical Health Education & Yoga', '[QUALIFICATION]', '[OFFICIAL EXPERIENCE]', '', 'Sports & Physical Health Incharge', true, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notices (id, title, category, description, notice_date, is_important, published)
VALUES
('not-1', 'Mandatory Public Disclosure Updated as per CBSE Appendix IX Guidelines', 'CBSE', 'The official Mandatory Public Disclosure page and associated document sections have been refreshed in accordance with the latest CBSE Affiliation Bye-Laws.', '2026-09-20', true, true),
('not-2', 'Admission Notification for Session 2027–2028 (Classes 1 to 9)', 'Admission', 'Admission enquiry and registration forms are available for the upcoming academic session. Parents are requested to review the eligibility criteria and document checklist.', '2026-09-15', true, true),
('not-3', 'Schedule for Periodic Assessment - II & Mid-Term Examinations', 'Examination', 'Detailed date sheet and syllabus guidelines for Classes 1 to 10 have been finalized. Students are advised to prepare systematically.', '2026-09-10', false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fees (id, academic_session, class_name, admission_fee, tuition_fee, annual_charges, other_charges, published)
VALUES
('fee-1', '2026-2027', 'Classes 1 to 5 (Primary Wing)', 'Rs. [OFFICIAL ADMISSION FEE]', 'Rs. [OFFICIAL TUITION FEE] / Month', 'Rs. [OFFICIAL ANNUAL CHARGES] / Year', 'Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]', true),
('fee-2', '2026-2027', 'Classes 6 to 8 (Middle Wing)', 'Rs. [OFFICIAL ADMISSION FEE]', 'Rs. [OFFICIAL TUITION FEE] / Month', 'Rs. [OFFICIAL ANNUAL CHARGES] / Year', 'Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]', true),
('fee-3', '2026-2027', 'Classes 9 to 10 (Secondary Wing)', 'Rs. [OFFICIAL ADMISSION FEE]', 'Rs. [OFFICIAL TUITION FEE] / Month', 'Rs. [OFFICIAL ANNUAL CHARGES] / Year', 'Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.smc_members (id, name, designation, role, other_information, published, sort_order)
VALUES
('smc-1', '[OFFICIAL PRESIDENT NAME]', 'President', 'President / Chairman', 'Trust / Society Nominee (Eminent Citizen)', true, 1),
('smc-2', '[PRINCIPAL NAME]', 'Member Secretary', 'Principal & Member Secretary', 'Head of Institution (Principal Ex-Officio)', true, 2),
('smc-3', '[TEACHER REPRESENTATIVE]', 'Teacher Member', 'Teacher Representative', 'Senior Secondary Faculty', true, 3),
('smc-4', '[PARENT REPRESENTATIVE]', 'Parent Member', 'Parent Representative', 'Parent of Student in Secondary Wing', true, 4),
('smc-5', '[CBSE NOMINEE NAME]', 'CBSE Nominee', 'CBSE / State Nominee', 'Education Department Officer', true, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transfer_certificates (id, tc_number, admission_number, student_initials, class_left, issue_date, reason, verification_status, published)
VALUES
('tc-1', 'SSVM/TC/2026/001', 'ADM-2021-104', '[STUDENT NAME / INITIALS]', 'Class 10', '2026-06-15', 'Passed CBSE AISSE Class X', 'Verified & Issued by School Office', true),
('tc-2', 'SSVM/TC/2026/002', 'ADM-2022-218', '[STUDENT NAME / INITIALS]', 'Class 8', '2026-07-04', 'Parent Relocation / Transfer', 'Verified & Issued by School Office', true),
('tc-3', 'SSVM/TC/2026/003', 'ADM-2023-342', '[STUDENT NAME / INITIALS]', 'Class 5', '2026-07-20', 'Parent Request / Relocation', 'Verified & Issued by School Office', true)
ON CONFLICT (id) DO NOTHING;
