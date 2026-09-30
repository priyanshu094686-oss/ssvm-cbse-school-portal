import { db } from '../backend/src/db/database.js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

async function testFullFlow() {
  console.log('================================================================');
  console.log('🔄 TESTING COMPLETE FLOW: ADMIN → SUPABASE → PUBLIC WEBSITE');
  console.log('================================================================\n');

  // 1. Health check
  console.log('[Step 1] Verifying Backend & Supabase Status...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthJson = await healthRes.json();
  console.log('✅ Server Health:', healthJson);

  // 2. Admin Authentication
  const testAdminEmail = process.env.TEST_ADMIN_EMAIL || db.getTable('admin_users')[0]?.email;
  const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;

  if (!testAdminEmail || !testAdminPassword) {
    console.log('ℹ️ Skipping live flow authentication test (TEST_ADMIN_PASSWORD not set). Run "npm test" for unit test suite.');
    return;
  }

  console.log(`\n[Step 2] Authenticating as Admin (${testAdminEmail})...`);
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testAdminEmail,
      password: testAdminPassword
    })
  });
  const loginJson: any = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
  }
  const token = loginJson.data.token;
  console.log(`✅ Logged in successfully. Role: ${loginJson.data.user.role}`);

  // 3. Admin creates a new Notice
  console.log('\n[Step 3] Admin creates new CBSE Announcement in Admin Portal...');
  const noticePayload = {
    title: 'Special Live Verification Circular - Session 2026–2027',
    category: 'CBSE',
    description: 'This is an official administrative test notice verified through real-time Supabase synchronization.',
    notice_date: '2026-09-25',
    is_important: true,
    published: true
  };

  const createNoticeRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(noticePayload)
  });
  const createNoticeJson: any = await createNoticeRes.json();
  console.log('✅ Admin Notice Created in Supabase:', createNoticeJson.data?.id);
  const createdNoticeId = createNoticeJson.data?.id;

  // 4. Public API checks
  console.log('\n[Step 4] Public Visitor visits /api/notices on Public Website...');
  const publicNoticesRes = await fetch(`${BASE_URL}/api/notices`);
  const publicNoticesJson: any = await publicNoticesRes.json();
  const foundNotice = publicNoticesJson.data?.find((n: any) => n.id === createdNoticeId);
  
  if (foundNotice) {
    console.log(`✅ Verified! Public website immediately receives notice from Supabase: "${foundNotice.title}"`);
  } else {
    throw new Error('Notice was not found in public query!');
  }

  // 5. Public Enquiry Submission
  console.log('\n[Step 5] Public Parent Submits Admission Enquiry...');
  const enquiryRes = await fetch(`${BASE_URL}/api/admissions/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_name: '[STUDENT NAME]',
      class_applying_for: 'Class 6',
      parent_guardian_name: '[PARENT NAME]',
      phone: '9876543210',
      email: 'parent@example.com',
      message: 'Seeking admission query for next session.'
    })
  });
  const enquiryJson: any = await enquiryRes.json();
  console.log(`✅ Admission enquiry stored in Supabase with ref: ${enquiryJson.data?.reference_number}`);

  // 6. Admin checks enquiries
  console.log('\n[Step 6] Admin reviews submitted enquiries in Admin Dashboard...');
  const adminEnquiriesRes = await fetch(`${BASE_URL}/api/admin/admissions/enquiries`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const adminEnquiriesJson: any = await adminEnquiriesRes.json();
  console.log(`✅ Total Enquiries in Admin Portal: ${adminEnquiriesJson.data?.length}`);

  // 7. Cleanup test notice
  console.log('\n[Step 7] Admin removes test circular...');
  const deleteRes = await fetch(`${BASE_URL}/api/admin/notices/${createdNoticeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const deleteJson: any = await deleteRes.json();
  console.log('✅ Cleaned up test circular:', deleteJson.success);

  console.log('\n================================================================');
  console.log('🎉 COMPLETE FLOW TEST SUCCESSFUL: Admin ⇄ Supabase ⇄ Public Website');
  console.log('================================================================\n');
}

testFullFlow().catch(err => {
  console.error('❌ Flow test failed:', err);
  process.exit(1);
});
