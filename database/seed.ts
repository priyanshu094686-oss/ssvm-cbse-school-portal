import bcrypt from 'bcryptjs';
import { db } from '../backend/src/db/database.js';

export async function runDatabaseSeed() {
  console.log('🌱 Starting Saraswati Shishu Vidya Mandir database seeding...');

  // 1. Seed Admin Users
  const superAdminPasswordHash = await bcrypt.hash('Admin@SSVM2026!', 10);
  const managerPasswordHash = await bcrypt.hash('Manager@SSVM2026!', 10);
  const editorPasswordHash = await bcrypt.hash('Editor@SSVM2026!', 10);
  const viewerPasswordHash = await bcrypt.hash('Viewer@SSVM2026!', 10);

  const adminUsers = [
    {
      id: 'usr-super-admin-01',
      email: 'admin@ssvm.edu.in',
      password_hash: superAdminPasswordHash,
      full_name: 'School Super Administrator',
      role: 'SUPER_ADMIN',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-manager-02',
      email: 'manager@ssvm.edu.in',
      password_hash: managerPasswordHash,
      full_name: 'School Content Manager',
      role: 'ADMIN',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-editor-03',
      email: 'editor@ssvm.edu.in',
      password_hash: editorPasswordHash,
      full_name: 'Academic Content Editor',
      role: 'EDITOR',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-viewer-04',
      email: 'viewer@ssvm.edu.in',
      password_hash: viewerPasswordHash,
      full_name: 'Audit & Compliance Viewer',
      role: 'VIEWER',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('admin_users', adminUsers);
  console.log('✅ Admin Users seeded.');

  // 2. Seed School Settings (Official Placeholders)
  const schoolSettings = [
    {
      id: 'settings-ssvm-01',
      school_name: 'Saraswati Shishu Vidya Mandir',
      affiliation_number: '[OFFICIAL CBSE AFFILIATION NUMBER]',
      school_code: '[OFFICIAL SCHOOL CODE]',
      address: '[OFFICIAL SCHOOL ADDRESS]',
      pin_code: '[PIN CODE]',
      official_email: '[OFFICIAL SCHOOL EMAIL]',
      official_phone: '[OFFICIAL PHONE NUMBER]',
      alt_phone: '[OFFICIAL ALTERNATIVE PHONE]',
      website: 'https://ssvm.edu.in',
      office_hours: 'Monday to Saturday: 8:00 AM – 3:30 PM',
      principal_name: '[PRINCIPAL NAME]',
      principal_qualification: '[PRINCIPAL QUALIFICATION]',
      principal_message: 'Welcome to Saraswati Shishu Vidya Mandir. Our institution is dedicated to imparting holistic education rooted in timeless cultural values while embracing modern pedagogical standards prescribed by the Central Board of Secondary Education (CBSE).',
      board: 'Central Board of Secondary Education (CBSE), New Delhi',
      classes: 'Classes 1 to 10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('school_settings', schoolSettings);
  console.log('✅ School Settings seeded.');

  // 3. Seed Principal
  const principals = [
    {
      id: 'principal-01',
      name: '[PRINCIPAL NAME]',
      qualification: '[PRINCIPAL QUALIFICATION]',
      designation: 'Principal',
      message: 'Education is the harmonious manifestation of perfection already in human beings.',
      photo_url: 'assets/images/logo.jpg',
      is_current: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('principals', principals);
  console.log('✅ Principal seeded.');

  // 4. Seed Staff Directory (Official Placeholders)
  const staff = [
    {
      id: 'fac-1',
      name: '[PRINCIPAL NAME]',
      staff_type: 'Principal',
      designation: 'Principal & Head of Institution',
      subject: 'Administration & Leadership',
      qualification: '[PRINCIPAL QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: 'assets/images/logo.jpg',
      bio: 'Head of institution responsible for academic administration and CBSE compliance.',
      is_published: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-2',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: '[DESIGNATION]',
      subject: 'Mathematics (Secondary Wing)',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: '',
      is_published: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-3',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: '[DESIGNATION]',
      subject: 'Science (Secondary Wing)',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: '',
      is_published: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-4',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: '[DESIGNATION]',
      subject: 'Social Science (Middle Wing)',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: '',
      is_published: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-5',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: '[DESIGNATION]',
      subject: 'Hindi & Sanskrit (Middle Wing)',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: '',
      is_published: true,
      sort_order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-6',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: '[DESIGNATION]',
      subject: 'English & EVS (Primary Wing)',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: '',
      is_published: true,
      sort_order: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-7',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: 'Special Educator',
      subject: 'Inclusive Education',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: 'Mandated special educator appointed as per CBSE norms.',
      is_published: true,
      sort_order: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fac-8',
      name: '[TEACHER NAME]',
      staff_type: 'Teaching Staff',
      designation: 'PTI / Yoga Instructor',
      subject: 'Physical Education & Yoga',
      qualification: '[QUALIFICATION]',
      experience: '[OFFICIAL EXPERIENCE]',
      photo_url: '',
      bio: 'Conducts daily morning assembly physical training and yoga.',
      is_published: true,
      sort_order: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('staff', staff);
  console.log('✅ Faculty & Staff seeded.');

  // 5. Seed Mandatory Public Disclosure Documents (CBSE Appendix IX 8-Point Matrix)
  const disclosureDocs = [
    {
      id: 'doc-1',
      document_name: 'CBSE Affiliation / Upgradation Letter & Recent Extension',
      category: '1. AFFILIATION / UPGRADATION',
      description: 'Copy of initial affiliation and subsequent extension letter issued by CBSE.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-2',
      document_name: 'Society / Trust Registration & Renewal Certificate',
      category: '2. SOCIETY / TRUST / COMPANY',
      description: 'Copies of registration and renewal certificates of the Society/Trust running the school.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-3',
      document_name: 'No Objection Certificate (NOC) Issued by State Govt. / UT',
      category: '3. NOC',
      description: 'Official NOC issued by the State School Education Department.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-4',
      document_name: 'Recognition Certificate under RTE Act, 2009 & Renewals',
      category: '4. RTE RECOGNITION',
      description: 'Copy of recognition certificate under Right to Education (RTE) Act 2009.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-5',
      document_name: 'Valid Building Safety Certificate (as per NBC)',
      category: '5. BUILDING SAFETY',
      description: 'Certificate issued by Competent Govt. Authority (PWD / Municipal Engineer) ensuring structural safety.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-6',
      document_name: 'Valid Fire Safety Certificate Issued by Competent Authority',
      category: '6. FIRE SAFETY',
      description: 'Fire safety certificate issued by the Chief Fire Officer / State Fire Service Authority.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-7',
      document_name: 'DEO Certificate / Self-Certification submitted for Affiliation',
      category: '7. DEO CERTIFICATE',
      description: 'District Education Officer certificate or prescribed self-certification submitted by school.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'doc-8',
      document_name: 'Valid Water, Health and Sanitation Certificates',
      category: '8. WATER / HEALTH / SANITATION',
      description: 'Potable drinking water test report and sanitary hygiene compliance certificate.',
      status: 'Official document to be uploaded by Saraswati Shishu Vidya Mandir.',
      status_code: 'pending',
      issue_date: '[OFFICIAL ISSUE DATE]',
      validity_date: '[OFFICIAL VALIDITY PERIOD]',
      last_updated: 'Official data to be verified',
      file_url: null,
      file_name: null,
      file_type: 'PDF',
      file_size: 'To be uploaded',
      verified: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('disclosure_documents', disclosureDocs);
  console.log('✅ Mandatory Public Disclosure Documents seeded.');

  // 6. Seed Disclosure General Info
  const disclosureGeneral = [
    {
      id: 'disc-gen-01',
      school_name: 'SARASWATI SHISHU VIDYA MANDIR',
      affiliation_number: '[OFFICIAL CBSE AFFILIATION NUMBER]',
      school_code: '[OFFICIAL SCHOOL CODE]',
      complete_address: '[OFFICIAL SCHOOL ADDRESS], [PIN CODE]',
      pin_code: '[PIN CODE]',
      principal_name: '[PRINCIPAL NAME]',
      principal_qualification: '[PRINCIPAL QUALIFICATION]',
      official_email: '[OFFICIAL SCHOOL EMAIL]',
      official_phone: '[OFFICIAL PHONE NUMBER]',
      last_updated: new Date().toISOString().split('T')[0],
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('disclosure_general_information', disclosureGeneral);
  console.log('✅ Disclosure General Info seeded.');

  // 7. Seed Notices
  const notices = [
    {
      id: 'not-01',
      title: 'Mandatory Public Disclosure Updated as per CBSE Appendix IX Guidelines',
      category: 'CBSE',
      description: 'The official Mandatory Public Disclosure page and associated document sections have been refreshed in accordance with the latest CBSE Affiliation Bye-Laws.',
      document_url: null,
      notice_date: '2026-09-20',
      is_important: true,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'not-02',
      title: 'Admission Notification for Session 2027–2028 (Classes 1 to 9)',
      category: 'Admission',
      description: 'Admission enquiry and registration forms are available for the upcoming academic session. Parents are requested to review the eligibility criteria and document checklist.',
      document_url: null,
      notice_date: '2026-09-15',
      is_important: true,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'not-03',
      title: 'Schedule for Periodic Assessment - II & Mid-Term Examinations',
      category: 'Examination',
      description: 'Detailed date sheet and syllabus guidelines for Classes 1 to 10 have been finalized. Students are advised to prepare systematically.',
      document_url: null,
      notice_date: '2026-09-10',
      is_important: false,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('notices', notices);
  console.log('✅ Notices seeded.');

  // 8. Seed Fees (Classes 1 to 10)
  const classNames = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];
  const fees = classNames.map((cName, i) => ({
    id: `fee-${String(i + 1).padStart(2, '0')}`,
    academic_session: '2026–2027',
    class_name: cName,
    admission_fee: '[OFFICIAL FEE INFORMATION]',
    tuition_fee: '[OFFICIAL FEE INFORMATION]',
    annual_charges: '[OFFICIAL FEE INFORMATION]',
    other_charges: '[OFFICIAL FEE INFORMATION]',
    payment_frequency: 'Quarterly',
    notes: 'Official fee structure as approved by the School Managing Committee.',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  db.saveTable('fees', fees);
  console.log('✅ Fees seeded.');

  // 9. Seed Academic Calendar
  const calendarEvents = [
    {
      id: 'cal-01',
      academic_session: '2026–2027',
      title: 'Commencement of Academic Session (Classes 1–10)',
      description: 'School opens for the new academic session.',
      event_type: 'Academic',
      event_date: 'April 01, 2026',
      end_date: null,
      document_url: null,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cal-02',
      academic_session: '2026–2027',
      title: 'Summer Vacation Break',
      description: 'Annual summer break for students.',
      event_type: 'Holiday',
      event_date: 'May 15, 2026',
      end_date: 'June 20, 2026',
      document_url: null,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cal-03',
      academic_session: '2026–2027',
      title: 'Periodic Assessment – I (PA-1)',
      description: 'First periodic assessment for Classes 1 to 10.',
      event_type: 'Examination',
      event_date: 'July 15, 2026',
      end_date: 'July 22, 2026',
      document_url: null,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cal-04',
      academic_session: '2026–2027',
      title: 'Independence Day Celebration',
      description: 'Flag hoisting and cultural program.',
      event_type: 'Celebrations',
      event_date: 'August 15, 2026',
      end_date: null,
      document_url: null,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('academic_calendar', calendarEvents);
  console.log('✅ Academic Calendar seeded.');

  // 10. Seed SMC Members
  const smc = [
    {
      id: 'smc-01',
      name: '[MEMBER NAME]',
      designation: 'President / Chairman',
      role: 'Trust Representative / Eminent Citizen',
      other_information: '3 Years Tenure',
      photo_url: null,
      published: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'smc-02',
      name: '[PRINCIPAL NAME]',
      designation: 'Member Secretary',
      role: 'Principal, Saraswati Shishu Vidya Mandir',
      other_information: 'Ex-Officio',
      photo_url: null,
      published: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'smc-03',
      name: '[MEMBER NAME]',
      designation: 'Member (Parent Rep)',
      role: 'Parent of Student (Class 8)',
      other_information: '3 Years Tenure',
      photo_url: null,
      published: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('smc_members', smc);
  console.log('✅ SMC Members seeded.');

  // 11. Seed Transfer Certificates (Safe Registry)
  const tcRecords = [
    {
      id: 'tc-01',
      tc_number: 'SSVM/TC/2026/001',
      admission_number: 'ADM-2021-104',
      student_initials: '[STUDENT NAME / INITIALS]',
      class_left: 'Class 10',
      issue_date: '2026-06-15',
      reason: 'Course Completed (Passed AISSE Class X)',
      document_url: null,
      verification_status: 'Verified & Issued by School Office',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('transfer_certificates', tcRecords);
  console.log('✅ Transfer Certificates seeded.');

  // 12. Seed Gallery
  const gallery = [
    {
      id: 'gal-01',
      title: 'Main School Building & Flagpost Courtyard',
      description: 'Dignified front facade of the school campus.',
      category: 'Campus',
      image_url: 'assets/images/campus.jpg',
      alt_text: 'Saraswati Shishu Vidya Mandir Main Building',
      event_date: '2026-08-15',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'gal-02',
      title: 'Morning Prayer, Yoga & Assembly',
      description: 'Daily morning prayer and yogic discipline.',
      category: 'Assembly',
      image_url: 'assets/images/assembly.jpg',
      alt_text: 'Students practicing morning assembly prayer and yoga',
      event_date: '2026-08-20',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'gal-03',
      title: 'Composite Science & Computer Laboratory',
      description: 'Laboratory environment for hands-on learning.',
      category: 'Lab',
      image_url: 'assets/images/lab.jpg',
      alt_text: 'Science and computer lab workstations',
      event_date: '2026-09-01',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('gallery', gallery);
  console.log('✅ Gallery seeded.');

  // 13. Seed Infrastructure
  const infra = [
    {
      id: 'inf-01',
      facility_name: 'Classrooms',
      category: 'Classrooms',
      description: 'Spacious, well-ventilated classrooms compliant with CBSE size norms.',
      image_url: 'assets/images/campus.jpg',
      available: '[Facility information to be provided by school]',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inf-02',
      facility_name: 'Composite Science Laboratory',
      category: 'Laboratories',
      description: 'Equipped with science apparatus for practical exploration.',
      image_url: 'assets/images/lab.jpg',
      available: '[Facility information to be provided by school]',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inf-03',
      facility_name: 'Computer Learning Facility',
      category: 'Computer Facilities',
      description: 'Broadband internet enabled workstations for digital literacy.',
      image_url: 'assets/images/lab.jpg',
      available: 'Available (Broadband Connected)',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('infrastructure', infra);
  console.log('✅ Infrastructure seeded.');

  // 14. Seed Achievements
  const achievements = [
    {
      id: 'ach-01',
      title: 'CBSE Class X AISSE Board Examination Performance Record',
      category: 'Class X Results',
      description: 'Official 3-year record maintained under Mandatory Public Disclosure.',
      achievement_date: '2026-05-15',
      image_url: null,
      document_url: null,
      workflow_stage: 'Published',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('achievements', achievements);
  console.log('✅ Achievements seeded.');

  // 15. Seed Downloads
  const downloads = [
    {
      id: 'dl-01',
      title: 'School Information Prospectus & Academic Guidelines',
      category: 'General Downloads',
      description: 'Institutional overview, rules, curriculum framework, and general guidelines.',
      file_url: 'https://zxsbxlhdezriofvtvmhk.supabase.co/storage/v1/object/public/school-documents/ssvm_prospectus.pdf',
      file_name: 'ssvm_prospectus.pdf',
      file_type: 'PDF',
      file_size: '1.8 MB',
      workflow_stage: 'Published',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'dl-02',
      title: 'Student Admission Application Form (Classes 1–10)',
      category: 'Proformas & Forms',
      description: 'Official registration & admission form for academic session enrollment.',
      file_url: 'https://zxsbxlhdezriofvtvmhk.supabase.co/storage/v1/object/public/forms/admission_form.pdf',
      file_name: 'admission_form.pdf',
      file_type: 'PDF',
      file_size: '450 KB',
      workflow_stage: 'Published',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'dl-03',
      title: 'Transfer Certificate (TC) Application Proforma',
      category: 'TC Proforma',
      description: 'Prescribed application proforma for requesting Transfer Certificate.',
      file_url: 'https://zxsbxlhdezriofvtvmhk.supabase.co/storage/v1/object/public/transfer-certificates/tc_application_form.pdf',
      file_name: 'tc_application_form.pdf',
      file_type: 'PDF',
      file_size: '320 KB',
      workflow_stage: 'Published',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  db.saveTable('downloads', downloads);
  console.log('✅ Downloads seeded.');

  console.log('🎉 Saraswati Shishu Vidya Mandir Database Seed Completed Successfully!');
}

// Run if called directly
if (process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))) {
  runDatabaseSeed().catch(console.error);
}
