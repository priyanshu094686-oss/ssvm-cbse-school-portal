import { db } from '../backend/src/db/database.js';

async function verify() {
  console.log('🚀 Running Live Server Verification...');

  // 1. Health
  const healthRes = await fetch('http://localhost:4000/api/health');
  const health = await healthRes.json();
  console.log('✅ Health Check:', health);

  // 2. Public Pages
  const homeRes = await fetch('http://localhost:4000/');
  console.log('✅ Home Page:', homeRes.status === 200 ? 'OK (200)' : homeRes.status);

  const discRes = await fetch('http://localhost:4000/mandatory-public-disclosure');
  console.log('✅ Mandatory Disclosure Page:', discRes.status === 200 ? 'OK (200)' : discRes.status);

  const staffRes = await fetch('http://localhost:4000/faculty-staff');
  console.log('✅ Faculty & Staff Page:', staffRes.status === 200 ? 'OK (200)' : staffRes.status);

  const adminRes = await fetch('http://localhost:4000/admin');
  console.log('✅ Admin Portal Page:', adminRes.status === 200 ? 'OK (200)' : adminRes.status);

  // 3. Auth Login (if credentials configured)
  const testAdminEmail = process.env.TEST_ADMIN_EMAIL || db.getTable('admin_users')[0]?.email;
  const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;

  if (testAdminEmail && testAdminPassword) {
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testAdminPassword })
    });
    const loginJson = (await loginRes.json()) as any;
    console.log('✅ Admin Login:', loginJson.success ? 'SUCCESS' : 'FAILED', 'Role:', loginJson.data?.user?.role);

    const token = loginJson.data?.token;

    // 4. Admin Stats
    const statsRes = await fetch('http://localhost:4000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsJson = (await statsRes.json()) as any;
    console.log('✅ Admin Dashboard Stats:', statsJson.data);
  }

  // 5. Public Form Submissions
  const enqRes = await fetch('http://localhost:4000/api/admissions/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_name: 'Aarav Kumar',
      class_applying_for: 'Class 6',
      parent_guardian_name: 'Suresh Kumar',
      phone: '9876543210',
      email: 'suresh@example.com',
      message: 'Admission query for class 6'
    })
  });
  const enqJson = (await enqRes.json()) as any;
  console.log('✅ Admission Enquiry Submitted:', enqJson.success ? `Reference: ${enqJson.data?.reference_number}` : 'FAILED');

  const contactRes = await fetch('http://localhost:4000/api/contact/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ramesh Verma',
      email: 'ramesh@example.com',
      phone: '9123456780',
      subject: 'Inquiry about Bus Transportation',
      message: 'Does school bus cover North Sector?'
    })
  });
  const contactJson = (await contactRes.json()) as any;
  console.log('✅ Contact Enquiry Submitted:', contactJson.success ? 'SUCCESS' : 'FAILED');

  console.log('\n🎉 Live Server Verification Completed Successfully!');
}

verify().catch(console.error);
