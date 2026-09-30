process.env.NODE_ENV = 'test';
import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../backend/src/server.js';
import { db } from '../backend/src/db/database.js';
import { StorageService } from '../backend/src/services/storageService.js';
import { runDatabaseSeed } from '../database/seed.js';

const TEST_PORT = 8089;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Configurable test credentials (via test environment variables)
const TEST_SUPER_ADMIN_EMAIL = process.env.TEST_SUPER_ADMIN_EMAIL || 'test-superadmin@ssvm.internal';
const TEST_SUPER_ADMIN_PASSWORD = process.env.TEST_SUPER_ADMIN_PASSWORD || 'TestSuperAdminPass2026!';
const TEST_EDITOR_EMAIL = process.env.TEST_EDITOR_EMAIL || 'test-editor@ssvm.internal';
const TEST_EDITOR_PASSWORD = process.env.TEST_EDITOR_PASSWORD || 'TestEditorPass2026!';

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

  // 2. Provision Isolated In-Memory Test Accounts for Automated Test Run
  const superAdminHash = await bcrypt.hash(TEST_SUPER_ADMIN_PASSWORD, 10);
  const editorHash = await bcrypt.hash(TEST_EDITOR_PASSWORD, 10);

  const testUsers = [
    {
      id: 'usr-test-super-admin',
      email: TEST_SUPER_ADMIN_EMAIL,
      password_hash: superAdminHash,
      full_name: 'Automated Test Super Admin',
      role: 'SUPER_ADMIN',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-test-editor',
      email: TEST_EDITOR_EMAIL,
      password_hash: editorHash,
      full_name: 'Automated Test Editor',
      role: 'EDITOR',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await db.saveTable('admin_users', testUsers);

  // 3. Start Test Server
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
    // TEST GROUP 2: MANDATORY PUBLIC DISCLOSURE
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 2: CBSE Mandatory Public Disclosure & Verification`);

    const disclosureRes = await fetch(`${BASE_URL}/api/mandatory-public-disclosure`);
    const disclosureJson = await getJSON(disclosureRes);
    assert(disclosureRes.status === 200 && disclosureJson.success === true, 'GET /api/mandatory-public-disclosure responds');
    assert(disclosureJson.data.documents.length === 8, 'Mandatory disclosure contains all 8 Appendix IX categories');

    const placeholderAffil = disclosureJson.data.general_information.affiliation_number;
    const placeholderCode = disclosureJson.data.general_information.school_code;
    assert(
      placeholderAffil.includes('OFFICIAL') || placeholderAffil.includes('AFFILIATION'),
      'Affiliation number contains official placeholder'
    );
    assert(
      placeholderCode.includes('OFFICIAL') || placeholderCode.includes('SCHOOL CODE'),
      'School code contains official placeholder'
    );

    // -------------------------------------------------------------
    // TEST GROUP 3: PUBLIC ENQUIRIES & FORM VALIDATION
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 3: Enquiries, Form Validation & Rate Limiting`);

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

    const invalidAdmission = {
      student_name: 'A',
      class_applying_for: 'Class 1',
      parent_guardian_name: 'R',
      phone: '123',
      email: 'invalid-email'
    };
    const invalidAdmRes = await fetch(`${BASE_URL}/api/admissions/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidAdmission)
    });
    const invalidAdmJson = await getJSON(invalidAdmRes);
    assert(invalidAdmRes.status === 400 && invalidAdmJson.success === false, 'POST /api/admissions/enquiry rejects invalid inputs with validation error');

    // -------------------------------------------------------------
    // TEST GROUP 4: AUTHENTICATION REQUIREMENTS (A - J)
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 4: Rebuilt Authentication System Tests (A through J)`);

    // A. Correct email + correct password → SUCCESS
    const loginSuccessRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_SUPER_ADMIN_EMAIL,
        password: TEST_SUPER_ADMIN_PASSWORD
      })
    });
    const loginSuccessJson = await getJSON(loginSuccessRes);
    assert(
      loginSuccessRes.status === 200 && loginSuccessJson.success === true && loginSuccessJson.data.token,
      'Test A: Correct email + correct password → SUCCESS (200 & JWT issued)'
    );
    assert(
      loginSuccessJson.data.user.password_hash === undefined,
      'Test A Security: password_hash is NEVER exposed in login response'
    );
    const superAdminToken = loginSuccessJson.data.token;
    const cookieHeader = loginSuccessRes.headers.get('set-cookie');
    assert(
      cookieHeader !== null && cookieHeader.includes('ssvm_session'),
      'Test A Security: HTTP-only session cookie ssvm_session set in response'
    );

    // B. Wrong password → 401
    const wrongPasswordRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_SUPER_ADMIN_EMAIL,
        password: 'CompletelyWrongPassword123!'
      })
    });
    const wrongPasswordJson = await getJSON(wrongPasswordRes);
    assert(
      wrongPasswordRes.status === 401 && wrongPasswordJson.error?.message === 'Invalid email or password.',
      'Test B: Wrong password → 401 (Generic error message)'
    );

    // C. Wrong email → 401
    const wrongEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent-user@example.com',
        password: 'SomePassword123!'
      })
    });
    const wrongEmailJson = await getJSON(wrongEmailRes);
    assert(
      wrongEmailRes.status === 401 && wrongEmailJson.error?.message === 'Invalid email or password.',
      'Test C: Wrong email → 401 (Generic error message, does not reveal existence)'
    );

    // D. Empty email → validation error (400)
    const emptyEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: 'ValidPassword123!'
      })
    });
    const emptyEmailJson = await getJSON(emptyEmailRes);
    assert(
      emptyEmailRes.status === 400 && emptyEmailJson.error?.code === 'VALIDATION_ERROR',
      'Test D: Empty email → validation error (HTTP 400)'
    );

    // E. Empty password → validation error (400)
    const emptyPasswordRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_SUPER_ADMIN_EMAIL,
        password: ''
      })
    });
    const emptyPasswordJson = await getJSON(emptyPasswordRes);
    assert(
      emptyPasswordRes.status === 400 && emptyPasswordJson.error?.code === 'VALIDATION_ERROR',
      'Test E: Empty password → validation error (HTTP 400)'
    );

    // F. Logout → session removed
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const logoutJson = await getJSON(logoutRes);
    assert(
      logoutRes.status === 200 && logoutJson.success === true,
      'Test F: Logout → session removed successfully (200)'
    );

    // G. /api/auth/me without session → 401
    const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
    const unauthMeJson = await getJSON(unauthMeRes);
    assert(
      unauthMeRes.status === 401 && unauthMeJson.error?.message === 'Authentication required.',
      'Test G: /api/auth/me without session → 401 (Authentication required.)'
    );

    // Verify /api/auth/me with valid session
    const authMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const authMeJson = await getJSON(authMeRes);
    assert(
      authMeRes.status === 200 && authMeJson.data?.email === TEST_SUPER_ADMIN_EMAIL,
      'GET /api/auth/me with valid token returns authenticated profile'
    );

    // H. Protected admin API without session → 401
    const unauthStatsRes = await fetch(`${BASE_URL}/api/admin/stats`);
    const unauthStatsJson = await getJSON(unauthStatsRes);
    assert(
      unauthStatsRes.status === 401 && unauthStatsJson.error?.code === 'UNAUTHORIZED',
      'Test H: Protected admin API without session → 401 Unauthorized'
    );

    // I. Insufficient role → 403
    const editorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EDITOR_EMAIL,
        password: TEST_EDITOR_PASSWORD
      })
    });
    const editorLoginJson = await getJSON(editorLoginRes);
    assert(editorLoginRes.status === 200, 'Editor login succeeds');
    const editorToken = editorLoginJson.data.token;

    // EDITOR attempting SUPER_ADMIN-only route (e.g. GET /api/auth/users)
    const editorForbiddenRes = await fetch(`${BASE_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${editorToken}` }
    });
    const editorForbiddenJson = await getJSON(editorForbiddenRes);
    assert(
      editorForbiddenRes.status === 403 && editorForbiddenJson.error?.code === 'INSUFFICIENT_PERMISSIONS',
      'Test I: Insufficient role → 403 Forbidden'
    );

    // J. Password change → new password works, old password fails
    const temporaryPassword = 'TemporaryNewPassword2026!';
    const changePwdRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        current_password: TEST_SUPER_ADMIN_PASSWORD,
        new_password: temporaryPassword
      })
    });
    const changePwdJson = await getJSON(changePwdRes);
    assert(changePwdRes.status === 200 && changePwdJson.success === true, 'Password change request succeeds (200)');

    // Old password must fail
    const oldLoginCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_SUPER_ADMIN_EMAIL,
        password: TEST_SUPER_ADMIN_PASSWORD
      })
    });
    assert(oldLoginCheck.status === 401, 'Test J: Old password fails with 401');

    // New password must succeed
    const newLoginCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_SUPER_ADMIN_EMAIL,
        password: temporaryPassword
      })
    });
    const newLoginCheckJson = await getJSON(newLoginCheck);
    assert(newLoginCheck.status === 200 && newLoginCheckJson.success === true, 'Test J: New password succeeds with 200');
    const newSessionToken = newLoginCheckJson.data.token;

    // Restore original password
    const restorePwdRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newSessionToken}`
      },
      body: JSON.stringify({
        current_password: temporaryPassword,
        new_password: TEST_SUPER_ADMIN_PASSWORD
      })
    });
    assert(restorePwdRes.status === 200, 'Original password successfully restored');

    // -------------------------------------------------------------
    // TEST GROUP 5: ADMIN DASHBOARD STATS & CRUD OPERATIONS
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 5: Admin Dashboard Stats & CRUD Operations`);

    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const statsJson = await getJSON(statsRes);
    assert(statsRes.status === 200 && statsJson.data.total_staff > 0, 'Admin stats returns staff counts');

    // Create Faculty
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

    // Delete Faculty
    const deleteStaffRes = await fetch(`${BASE_URL}/api/admin/staff/${createdStaffId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert(deleteStaffRes.status === 200, 'DELETE /api/admin/staff/:id removes faculty record');

    // -------------------------------------------------------------
    // TEST GROUP 6: AUDIT TRAIL LOGGING
    // -------------------------------------------------------------
    console.log(`\n📁 TEST GROUP 6: Security Audit Logs`);

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const auditJson = await getJSON(auditRes);
    assert(auditRes.status === 200 && Array.isArray(auditJson.data) && auditJson.data.length > 0, 'GET /api/admin/audit-logs retrieves audit trail');
    assert(auditJson.data.some((log: any) => log.action === 'LOGIN'), 'Audit trail logs administrative logins');

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
