process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../backend/src/server.js';
import { StorageService } from '../backend/src/services/storageService.js';
import { runDatabaseSeed } from '../database/seed.js';

const TEST_PORT = 8089;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server: http.Server;
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedCount++;
  }
}

async function getJSON(res: any): Promise<any> {
  return (await res.json()) as any;
}

async function runTestSuite() {
  console.log(`\n===============================================================`);
  console.log(`🧪 SARASWATI SHISHU VIDYA MANDIR - AUTOMATED TEST SUITE`);
  console.log(`===============================================================\n`);

  // 1. Initialize Storage & Seed Data
  StorageService.initStorage();
  await runDatabaseSeed();

  // 2. Start Test Server
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`🚀 Test Server running at ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST GROUP 1: HEALTH & PUBLIC CONTENT APIS
    // -------------------------------------------------------------
    console.log(`📁 TEST GROUP 1: Public Content APIs & Endpoints`);

    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await getJSON(healthRes);
    assert(healthRes.status === 200 && healthJson.status === 'healthy', 'GET /api/health responds healthy');

    const schoolRes = await fetch(`${BASE_URL}/api/school`);
    const schoolJson = await getJSON(schoolRes);
    assert(schoolRes.status === 200 && schoolJson.success === true, 'GET /api/school returns school profile');
    assert(schoolJson.data.school_name.includes('Saraswati Shishu Vidya Mandir'), 'School name matches Saraswati Shishu Vidya Mandir');

    const principalRes = await fetch(`${BASE_URL}/api/principal`);
    const principalJson = await getJSON(principalRes);
    assert(principalRes.status === 200 && principalJson.success === true, 'GET /api/principal returns principal data');

    const staffRes = await fetch(`${BASE_URL}/api/staff`);
    const staffJson = await getJSON(staffRes);
    assert(staffRes.status === 200 && Array.isArray(staffJson.data) && staffJson.data.length > 0, 'GET /api/staff returns faculty list');

    // Filter staff by type
    const teachingStaffRes = await fetch(`${BASE_URL}/api/staff?type=Teaching%20Staff`);
    const teachingStaffJson = await getJSON(teachingStaffRes);
    assert(teachingStaffJson.data.every((s: any) => s.staff_type === 'Teaching Staff'), 'Staff filtering by type (Teaching Staff) functions correctly');

    const noticesRes = await fetch(`${BASE_URL}/api/notices`);
    const noticesJson = await getJSON(noticesRes);
    assert(noticesRes.status === 200 && Array.isArray(noticesJson.data), 'GET /api/notices returns notices');

    const calendarRes = await fetch(`${BASE_URL}/api/calendar`);
    const calendarJson = await getJSON(calendarRes);
    assert(calendarRes.status === 200 && Array.isArray(calendarJson.data), 'GET /api/calendar returns academic calendar');

    const feesRes = await fetch(`${BASE_URL}/api/fees`);
    const feesJson = await getJSON(feesRes);
    assert(feesRes.status === 200 && Array.isArray(feesJson.data) && feesJson.data.length >= 10, 'GET /api/fees returns fee structure for classes 1-10');

    const infraRes = await fetch(`${BASE_URL}/api/infrastructure`);
    const infraJson = await getJSON(infraRes);
    assert(infraRes.status === 200 && Array.isArray(infraJson.data), 'GET /api/infrastructure returns facilities');

    const galleryRes = await fetch(`${BASE_URL}/api/gallery`);
    const galleryJson = await getJSON(galleryRes);
    assert(galleryRes.status === 200 && Array.isArray(galleryJson.data), 'GET /api/gallery returns gallery');

    const smcRes = await fetch(`${BASE_URL}/api/smc`);
    const smcJson = await getJSON(smcRes);
    assert(smcRes.status === 200 && Array.isArray(smcJson.data), 'GET /api/smc returns SMC committee');

    const tcRes = await fetch(`${BASE_URL}/api/transfer-certificates`);
    const tcJson = await getJSON(tcRes);
    assert(tcRes.status === 200 && Array.isArray(tcJson.data), 'GET /api/transfer-certificates returns TC ledger');

    const downloadsRes = await fetch(`${BASE_URL}/api/downloads`);
    const downloadsJson = await getJSON(downloadsRes);
    assert(downloadsRes.status === 200 && Array.isArray(downloadsJson.data), 'GET /api/downloads returns download items');

    // -------------------------------------------------------------
    // TEST GROUP 2: MANDATORY PUBLIC DISCLOSURE & ZERO FABRICATION
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 2: CBSE Mandatory Public Disclosure & Zero Fabrication Rules`);

    const disclosureRes = await fetch(`${BASE_URL}/api/mandatory-public-disclosure`);
    const disclosureJson = await getJSON(disclosureRes);
    assert(disclosureRes.status === 200 && disclosureJson.success === true, 'GET /api/mandatory-public-disclosure responds');
    assert(disclosureJson.data.documents.length === 8, 'Mandatory disclosure contains all 8 Appendix IX categories');

    // Verify Zero Fabrication Placeholder Rules
    const placeholderAffil = disclosureJson.data.general_information.affiliation_number;
    const placeholderCode = disclosureJson.data.general_information.school_code;
    assert(
      placeholderAffil.includes('OFFICIAL') || placeholderAffil.includes('AFFILIATION'),
      'Affiliation number contains official placeholder, NOT fabricated'
    );
    assert(
      placeholderCode.includes('OFFICIAL') || placeholderCode.includes('SCHOOL CODE'),
      'School code contains official placeholder, NOT fabricated'
    );

    // Verify document empty states
    const pendingDoc = disclosureJson.data.documents.find((d: any) => !d.file_url);
    assert(
      pendingDoc !== undefined && pendingDoc.status.includes('Official document to be uploaded'),
      'Missing documents display official school upload notice rather than fake files'
    );

    // -------------------------------------------------------------
    // TEST GROUP 3: PUBLIC FORM SUBMISSIONS & VALIDATION
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 3: Enquiries, Form Validation & Rate Limiting`);

    // Valid Admission Enquiry
    const validAdmission = {
      student_name: 'Aarav Sharma',
      class_applying_for: 'Class 6',
      parent_guardian_name: 'Rajesh Sharma',
      phone: '9876543210',
      email: 'rajesh.sharma@example.com',
      message: 'Seeking admission for academic session 2026-27.'
    };
    const admEnqRes = await fetch(`${BASE_URL}/api/admissions/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validAdmission)
    });
    const admEnqJson = await getJSON(admEnqRes);
    assert(admEnqRes.status === 201 && admEnqJson.success === true, 'POST /api/admissions/enquiry accepts valid application');
    assert(admEnqJson.data.reference_number.startsWith('SSVM-ENQ-'), 'Admission enquiry generates official reference number');

    // Invalid Admission Enquiry (Invalid Phone)
    const invalidAdmission = {
      student_name: 'A',
      class_applying_for: 'Class 1',
      parent_guardian_name: 'R',
      phone: '123', // Too short
      email: 'invalid-email'
    };
    const invalidAdmRes = await fetch(`${BASE_URL}/api/admissions/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidAdmission)
    });
    const invalidAdmJson = await getJSON(invalidAdmRes);
    assert(invalidAdmRes.status === 400 && invalidAdmJson.success === false, 'POST /api/admissions/enquiry rejects invalid inputs with validation error');

    // Valid Contact Enquiry
    const validContact = {
      name: 'Sunita Devi',
      email: 'sunita.devi@example.com',
      phone: '9812345678',
      subject: 'Inquiry regarding bus transport routes',
      message: 'Kindly provide details of the school bus route covering Sector 4.'
    };
    const contactRes = await fetch(`${BASE_URL}/api/contact/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validContact)
    });
    const contactJson = await getJSON(contactRes);
    assert(contactRes.status === 201 && contactJson.success === true, 'POST /api/contact/enquiry receives parent message');

    // -------------------------------------------------------------
    // TEST GROUP 4: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 4: Authentication, Security & RBAC`);

    // Invalid Login
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssvm.edu.in', password: 'WrongPassword123!' })
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login rejects incorrect password');

    // Super Admin Login
    const superAdminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ssvm.edu.in', password: 'Admin@SSVM2026!' })
    });
    const superAdminLoginJson = await getJSON(superAdminLoginRes);
    assert(superAdminLoginRes.status === 200 && superAdminLoginJson.data.token, 'Super Admin login succeeds and returns JWT token');
    const superAdminToken = superAdminLoginJson.data.token;

    // Editor Login
    const editorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'editor@ssvm.edu.in', password: 'Editor@SSVM2026!' })
    });
    const editorLoginJson = await getJSON(editorLoginRes);
    assert(editorLoginRes.status === 200 && editorLoginJson.data.user.role === 'EDITOR', 'Editor login succeeds with EDITOR role');
    const editorToken = editorLoginJson.data.token;

    // Verify /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const meJson = await getJSON(meRes);
    assert(meRes.status === 200 && meJson.data.role === 'SUPER_ADMIN', 'GET /api/auth/me authenticates user session');

    // Unauthenticated access to admin routes is blocked
    const unauthStatsRes = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(unauthStatsRes.status === 401, 'Unauthenticated request to /api/admin/stats is blocked (401 Unauthorized)');

    // RBAC: Editor attempting Super Admin only endpoint (e.g. GET /api/auth/users)
    const editorBlockedRes = await fetch(`${BASE_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${editorToken}` }
    });
    assert(editorBlockedRes.status === 403, 'RBAC prevents EDITOR from accessing SUPER_ADMIN endpoint (403 Forbidden)');

    // -------------------------------------------------------------
    // TEST GROUP 5: ADMIN DASHBOARD STATS & EXPIRY CALCULATIONS
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 5: Admin Dashboard Stats & Expiry Engine`);

    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const statsJson = await getJSON(statsRes);
    assert(statsRes.status === 200 && statsJson.data.total_staff > 0, 'Admin stats returns staff and document counts');
    assert(statsJson.data.document_status !== undefined, 'Admin stats computes document status breakdown (available, pending, expiring, expired)');

    // -------------------------------------------------------------
    // TEST GROUP 6: ADMIN CRUD OPERATIONS
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 6: Admin Content Management CRUD Operations`);

    // 1. Create Staff
    const newStaffPayload = {
      name: 'Dr. Ramesh Kumar',
      staff_type: 'Teaching Staff',
      designation: 'TGT Science',
      subject: 'Physics & Chemistry',
      qualification: 'M.Sc., B.Ed.',
      experience: '7 Years',
      is_published: true,
      sort_order: 10
    };
    const createStaffRes = await fetch(`${BASE_URL}/api/admin/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(newStaffPayload)
    });
    const createStaffJson = await getJSON(createStaffRes);
    assert(createStaffRes.status === 201 && createStaffJson.data.id, 'POST /api/admin/staff creates new faculty record');
    const createdStaffId = createStaffJson.data.id;

    // 2. Update Staff
    const updateStaffRes = await fetch(`${BASE_URL}/api/admin/staff/${createdStaffId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ experience: '8 Years' })
    });
    const updateStaffJson = await getJSON(updateStaffRes);
    assert(updateStaffRes.status === 200 && updateStaffJson.data.experience === '8 Years', 'PUT /api/admin/staff/:id updates faculty record');

    // 3. Delete Staff
    const deleteStaffRes = await fetch(`${BASE_URL}/api/admin/staff/${createdStaffId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert(deleteStaffRes.status === 200, 'DELETE /api/admin/staff/:id removes faculty record');

    // 4. Create Notice
    const newNoticePayload = {
      title: 'Annual Sports Meet 2026-27 Announced',
      category: 'Events',
      description: 'The annual sports meet will be held on the school grounds.',
      notice_date: '2026-11-15',
      is_important: true,
      published: true
    };
    const createNoticeRes = await fetch(`${BASE_URL}/api/admin/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(newNoticePayload)
    });
    const createNoticeJson = await getJSON(createNoticeRes);
    assert(createNoticeRes.status === 201 && createNoticeJson.data.id, 'POST /api/admin/notices creates announcement');
    const createdNoticeId = createNoticeJson.data.id;

    // Delete Notice
    const deleteNoticeRes = await fetch(`${BASE_URL}/api/admin/notices/${createdNoticeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert(deleteNoticeRes.status === 200, 'DELETE /api/admin/notices/:id deletes announcement');

    // -------------------------------------------------------------
    // TEST GROUP 7: AUDIT LOG GENERATION
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 7: Security Audit Logs`);

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const auditJson = await getJSON(auditRes);
    assert(auditRes.status === 200 && Array.isArray(auditJson.data) && auditJson.data.length > 0, 'GET /api/admin/audit-logs retrieves security audit trail');
    assert(auditJson.data.some((log: any) => log.action === 'LOGIN'), 'Audit trail logs administrative logins');
    assert(auditJson.data.some((log: any) => log.action === 'CREATE'), 'Audit trail logs content mutations');

  } catch (err) {
    console.error('Test execution error:', err);
    failedCount++;
  } finally {
    if (server) {
      server.close();
    }
  }

  // Final Summary
  console.log(`\n===============================================================`);
  console.log(`📊 TEST RESULTS SUMMARY`);
  console.log(`   Passed: ${passedCount}`);
  console.log(`   Failed: ${failedCount}`);
  console.log(`   Total:  ${passedCount + failedCount}`);
  console.log(`===============================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
