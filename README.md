# SARASWATI SHISHU VIDYA MANDIR — OFFICIAL CBSE WEB PORTAL & MANAGEMENT SYSTEM

[![CBSE Compliant](https://img.shields.io/badge/CBSE-Appendix%20IX%20Compliant-0F2942?style=for-the-badge&logo=shield)](http://localhost:4000/mandatory-public-disclosure)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2F%20Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com)

A modern, production-ready school portal, backend API, multi-bucket document storage, authentication engine, and administrative content-management system designed specifically for **Saraswati Shishu Vidya Mandir** (CBSE Affiliated, Classes 1 to 10 in India).

Built strictly according to **CBSE Affiliation Bye-Laws** and the **Appendix IX Mandatory Public Disclosure** framework.

---

## 🏛️ 1. Institutional Compliance & Zero Fabrication Rules

This portal is structured for real-world school operations. In accordance with statutory norms:
* **Zero Fabrication:** The system does NOT invent or fabricate CBSE affiliation numbers, school codes, addresses, faculty names, fees, government certificates, examination results, or management members.
* **Institutional Placeholders:** All unsupplied official data is stored and displayed with verified institutional placeholders (e.g., `[OFFICIAL CBSE AFFILIATION NUMBER]`, `[OFFICIAL SCHOOL CODE]`, `[OFFICIAL SCHOOL ADDRESS]`, `[OFFICIAL FEE INFORMATION]`).
* **Missing Document Handling:** For missing official documents, the public disclosure ledger explicitly displays:
  > *"Official document to be uploaded by Saraswati Shishu Vidya Mandir."*
* **Official Upload Safety Warning:** School administrators receive a mandatory verification prompt before publishing official compliance documents.

---

## 🛠️ 2. Technology Stack & Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │           PUBLIC VISITORS / PARENTS     │
                                  └────────────────────┬────────────────────┘
                                                       │
                                 ┌─────────────────────┴─────────────────────┐
                                 │   Frontend: HTML5 / CSS3 / Vanilla JS    │
                                 │   17 Responsive Pages + Rich Aesthetics  │
                                 └─────────────────────┬─────────────────────┘
                                                       │  REST API / HTTP
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS / TYPESCRIPT BACKEND ENGINE                              │
│                                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────────────────┐  │
│  │   Security Middleware │  │    Auth & RBAC (JWT)  │  │   Input Validation (Zod)        │  │
│  │   Helmet, CORS, Rate  │  │    SUPER_ADMIN, ADMIN │  │   Strict Schema Enforcement     │  │
│  │   Limiting, Sanitizer │  │    EDITOR, VIEWER     │  │   Phone / Email / File Filters  │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────────────────────┘  │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  REST API Routing & Controllers:                                                      │  │
│  │  /api/school  •  /api/mandatory-public-disclosure  •  /api/staff  •  /api/notices     │  │
│  │  /api/fees    •  /api/calendar  •  /api/infrastructure  •  /api/admissions/enquiry     │  │
│  │  /api/admin/* (Protected CRUD)  •  /api/upload/* (Multi-Bucket Storage Handler)       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
       ┌─────────────────────────────────┐           ┌─────────────────────────────────┐
       │     DATABASE PERSISTENCE        │           │     MULTI-BUCKET FILE STORAGE   │
       │                                 │           │                                 │
       │ • Supabase PostgreSQL (Cloud)   │           │ • school-documents              │
       │   - Full 17 Relational Tables   │           │ • notices                       │
       │   - Row Level Security (RLS)    │           │ • gallery                       │
       │                                 │           │ • staff                         │
       │ • Embedded Local Store (JSON)   │           │ • achievements                  │
       │   - Zero-Config Local Execution │           │ • calendar                      │
       │   - ACID-safe write serialization│           │ • forms / transfer-certificates │
       └─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 🗄️ 3. Database Architecture & Schema

The database consists of 17 main relational tables with primary keys, foreign constraints, indexes, timestamps, and publication toggles:

| Table Name | Description | Key Fields |
|:---|:---|:---|
| `admin_users` | Administrative accounts & RBAC | `id`, `email`, `password_hash`, `role`, `is_active`, `last_login_at` |
| `school_settings` | Core school metadata & profile | `id`, `school_name`, `affiliation_number`, `school_code`, `address`, `principal_name` |
| `principals` | Principal tenure and message | `id`, `name`, `qualification`, `designation`, `message`, `photo_url`, `is_current` |
| `staff` | Faculty and non-teaching personnel | `id`, `name`, `staff_type`, `designation`, `subject`, `qualification`, `experience` |
| `disclosure_documents` | CBSE Appendix IX 8-Point Matrix | `id`, `document_name`, `category`, `status`, `issue_date`, `validity_date`, `file_url`, `verified` |
| `disclosure_general_information` | CBSE Appendix IX General Info | `id`, `school_name`, `affiliation_number`, `school_code`, `complete_address`, `official_phone` |
| `notices` | School circulars & announcements | `id`, `title`, `category`, `description`, `document_url`, `notice_date`, `is_important`, `published` |
| `academic_calendar` | Annual schedule of events & exams | `id`, `academic_session`, `title`, `event_type`, `event_date`, `end_date`, `published` |
| `fees` | Class-wise fee structures (1 to 10) | `id`, `academic_session`, `class_name`, `admission_fee`, `tuition_fee`, `annual_charges` |
| `infrastructure` | Physical facilities & labs | `id`, `facility_name`, `category`, `description`, `image_url`, `available`, `published` |
| `achievements` | Board results & awards ledger | `id`, `title`, `category`, `description`, `achievement_date`, `image_url`, `published` |
| `gallery` | Campus & event photo repository | `id`, `title`, `category`, `image_url`, `alt_text`, `event_date`, `published` |
| `smc_members` | School Managing Committee | `id`, `name`, `designation`, `role`, `other_information`, `photo_url`, `published` |
| `transfer_certificates` | Privacy-conscious TC verification | `id`, `tc_number`, `admission_number`, `student_initials`, `class_left`, `issue_date` |
| `admission_enquiries` | Confidential admission leads | `id`, `ref_number`, `student_name`, `class_applying_for`, `parent_guardian_name`, `phone`, `status` |
| `contact_enquiries` | Public feedback & general enquiries | `id`, `name`, `email`, `phone`, `subject`, `message`, `status` |
| `audit_logs` | Administrative security trail | `id`, `admin_user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `ip_address` |

---

## 🔒 4. Security & Role-Based Access Control (RBAC)

Authentication is backed by salted `bcrypt` password hashing (10 rounds) and signed `JWT` tokens with HTTP-only session cookies.

### Administrative Roles:
* `SUPER_ADMIN`: Full system access, administrator management, security audit review, and critical school configurations.
* `ADMIN`: Manage school information, mandatory documents, faculty, notices, fees, calendar, and enquiries.
* `EDITOR`: Create and update notices, calendar items, gallery photos, and staff records. (Restricted from user management and irreversible operations).
* `VIEWER`: Read-only access to administrative analytics and enquiry dashboards.

---

## 📂 5. Multi-Bucket Storage System

Uploads are routed to 8 logical, segregated storage buckets with strict MIME validation (PDF, JPG, JPEG, PNG, WEBP), file extension verification, and 10MB size limits:
1. `school-documents` — Official CBSE affiliation letters, building/fire safety certificates, NOCs.
2. `notices` — Official circulars and date sheets.
3. `gallery` — Campus photos, prayer assemblies, sports meets.
4. `staff` — Faculty portraits.
5. `achievements` — Academic certificates and awards.
6. `calendar` — Printable academic schedules.
7. `forms` — Blank admission registration forms and syllabi.
8. `transfer-certificates` — Issued TC copies.

---

## 🚀 6. Quick Start & Local Development

### Prerequisites
* **Node.js** v18.x or higher (v22.x recommended)
* **NPM** v9.x or higher

### Installation & Execution
```bash
# 1. Clone repository
git clone <repository-url>
cd CBSE

# 2. Install dependencies
npm install

# 3. Initialize & Seed Database with Official Placeholders
npm run db:seed

# 4. Run Automated Test Suite (39 Automated Integration Tests)
npm test

# 5. Start Development Server
npm run dev
```

The portal will be active at:
* 🌐 **Public Website:** `http://localhost:4000`
* 📋 **Mandatory Public Disclosure:** `http://localhost:4000/mandatory-public-disclosure`
* 🛡️ **Admin Portal:** `http://localhost:4000/admin`

---

## 🔑 7. Administrator Roles & Access

Upon initial database seeding, administrative accounts are provisioned for role-based governance:

| Role | Email | Initial Password | Access Level |
|:---|:---|:---|:---|
| **Super Admin** | `admin@ssvm.edu.in` | *(Configured via Seed / Env)* | Full Master Access |
| **Manager / Admin** | `manager@ssvm.edu.in` | *(Configured via Seed / Env)* | Full School Content & Document Management |
| **Editor** | `editor@ssvm.edu.in` | *(Configured via Seed / Env)* | Content & Documents Draft / Review Editor |
| **Viewer** | `viewer@ssvm.edu.in` | *(Configured via Seed / Env)* | Read-only Compliance & Audit Viewer |

> ⚠️ **Production Security Notice:** Administrator passwords must be managed securely through the admin settings or environment/database seed, and never committed to version control.

---

## 🌐 8. Supabase & PostgreSQL Production Setup

To connect to a managed Supabase PostgreSQL instance:

1. Create a project in [Supabase](https://supabase.com).
2. Retrieve the PostgreSQL connection string from **Project Settings** -> **Database**.
3. Create a `.env` file from `.env.example`:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres.xxxx:your_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=generate_a_secure_64_character_random_string_here
COOKIE_SECRET=generate_another_secure_64_character_secret_here
CORS_ORIGIN=https://www.ssvm.edu.in
```
4. Execute schema migrations and seed scripts:
```bash
npm run db:migrate
npm run db:seed
```

---

## 🧪 9. Automated Testing Suite

The project includes an automated test suite verifying all 39 critical functionality and security points:
```bash
npm test
```

### Coverage Summary:
* ✅ **Public Content APIs:** `/api/school`, `/api/principal`, `/api/staff`, `/api/notices`, `/api/calendar`, `/api/fees`, `/api/infrastructure`, `/api/gallery`, `/api/smc`, `/api/transfer-certificates`, `/api/downloads`.
* ✅ **Mandatory Public Disclosure:** All 8 Appendix IX categories verified.
* ✅ **Zero Fabrication Checks:** Asserts that placeholders are preserved and no fake certificates/numbers exist.
* ✅ **Form Submissions & Validation:** Admission & Contact enquiry insertion, phone format validation, and reference number generation.
* ✅ **Authentication & RBAC:** Password hashing, JWT issuance, unauthenticated route blocking, and role-based privilege restriction.
* ✅ **Admin Content CRUD:** Staff creation/update/deletion, notice posting, fee updating.
* ✅ **Document Expiry Engine:** Dynamic status categorization (*Available*, *Pending*, *Expiring Soon*, *Expired*).
* ✅ **Audit Trail:** Automatic logging of logins, updates, and uploads.

---

## 📖 10. School Administrator Operating Manual

### How to Update School Information
1. Log in at `http://localhost:4000/admin` (or `/admin.html`).
2. Select the **General Information** tab.
3. Update the Principal's Name, Affiliation Number, School Code, Address, Phone, or Official Email.
4. Click **Save General Information**. The entire website updates in real time.

### How to Upload Mandatory Disclosure Documents
1. Navigate to the **Mandatory Disclosure** tab.
2. Locate the statutory document category (e.g., *Fire Safety*, *Building Safety*, *NOC*).
3. Click **Upload / Edit Document**.
4. Read the verification safety notice: *"Please verify that this document is an official document issued to Saraswati Shishu Vidya Mandir."*
5. Select the official PDF/Image file from your computer.
6. Enter the official **Issue Date** and **Validity Period**.
7. Set status to **Available & Verified Official Copy** and click **Save Document Details**.
8. The document is immediately accessible on the public `/mandatory-public-disclosure` page.

### How to Post a New Notice / Circular
1. Click **Notices & Circulars** in the sidebar.
2. Click **➕ Post Notice**.
3. Enter Title, Category (*Admission*, *Examination*, *Holiday*, *CBSE*, *Important*), Date, and Description.
4. Optionally attach an official circular PDF.
5. Click **Post Notice**.

### How to Process Admission Enquiries
1. Navigate to **Admission Enquiries**.
2. Review new student applications, parent names, classes applied for, and contact details.
3. Update status from `New` to `Contacted`, `In Progress`, or `Resolved`.

---

## 📄 11. CBSE Appendix IX Quick Reference

This portal organizes disclosure documents in full accordance with CBSE Circular No. 03/2021:
* **Doc 1:** Copies of Affiliation / Upgradation Letter & Recent Extension of Affiliation
* **Doc 2:** Copies of Societies / Trust / Company Registration / Renewal Certificate
* **Doc 3:** Copy of No Objection Certificate (NOC) Issued by State Government
* **Doc 4:** Copies of Recognition Certificate Under RTE Act, 2009 & Its Renewal
* **Doc 5:** Copy of Valid Building Safety Certificate as per National Building Code
* **Doc 6:** Copy of Valid Fire Safety Certificate Issued by Competent Authority
* **Doc 7:** Copy of DEO Certificate Submitted for Affiliation / Self-Certification
* **Doc 8:** Copies of Valid Water, Health and Sanitation Certificates

---

## 🛡️ 12. License & Ownership

Developed for **Saraswati Shishu Vidya Mandir**. All statutory rights and institutional materials are reserved by the School Managing Committee.
