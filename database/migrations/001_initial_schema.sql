-- ==========================================================================
-- SARASWATI SHISHU VIDYA MANDIR - CBSE AFFILIATED INSTITUTION
-- Database Schema: PostgreSQL & Supabase Compatible Initial Schema
-- ==========================================================================

-- 1. Admin Users Table (RBAC)
CREATE TABLE IF NOT EXISTS admin_users (
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

-- 2. School Settings Table
CREATE TABLE IF NOT EXISTS school_settings (
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

-- 3. Principals Table
CREATE TABLE IF NOT EXISTS principals (
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

-- 4. Staff Table
CREATE TABLE IF NOT EXISTS staff (
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

-- 5. Notices Table
CREATE TABLE IF NOT EXISTS notices (
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

-- 6. Academic Calendar Table
CREATE TABLE IF NOT EXISTS academic_calendar (
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

-- 7. Fees Table
CREATE TABLE IF NOT EXISTS fees (
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

-- 8. Infrastructure Table
CREATE TABLE IF NOT EXISTS infrastructure (
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

-- 9. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
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

-- 10. Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
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

-- 11. Disclosure General Information Table (CBSE Appendix IX Part A)
CREATE TABLE IF NOT EXISTS disclosure_general_information (
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

-- 12. Disclosure Documents Table (CBSE Appendix IX Part B 8-Point Matrix)
CREATE TABLE IF NOT EXISTS disclosure_documents (
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

-- 13. SMC Members Table
CREATE TABLE IF NOT EXISTS smc_members (
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

-- 14. Transfer Certificates Table
CREATE TABLE IF NOT EXISTS transfer_certificates (
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

-- 15. Admission Enquiries Table (Private Admin Only)
CREATE TABLE IF NOT EXISTS admission_enquiries (
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

-- 16. Contact Enquiries Table (Private Admin Only)
CREATE TABLE IF NOT EXISTS contact_enquiries (
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

-- 17. Audit Logs Table (Private Security Audit)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- ==========================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(staff_type);
CREATE INDEX IF NOT EXISTS idx_staff_published ON staff(is_published);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(published, notice_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_calendar_published ON academic_calendar(published);
CREATE INDEX IF NOT EXISTS idx_fees_published ON fees(published);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_tc_number ON transfer_certificates(tc_number);
CREATE INDEX IF NOT EXISTS idx_tc_admission ON transfer_certificates(admission_number);
CREATE INDEX IF NOT EXISTS idx_disclosure_docs_category ON disclosure_documents(category);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
