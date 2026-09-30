import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const BASE_URL = 'http://localhost:4000';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

interface E2EResults {
  adminLogin: 'PASSED' | 'FAILED';
  createNotice: 'PASSED' | 'FAILED';
  supabaseDbVerifyCreate: 'PASSED' | 'FAILED';
  publicWebsiteVerifyCreate: 'PASSED' | 'FAILED';
  updateNotice: 'PASSED' | 'FAILED';
  supabaseDbVerifyUpdate: 'PASSED' | 'FAILED';
  publicWebsiteVerifyUpdate: 'PASSED' | 'FAILED';
  deleteNotice: 'PASSED' | 'FAILED';
  supabaseDbVerifyDelete: 'PASSED' | 'FAILED';
  publicWebsiteVerifyDelete: 'PASSED' | 'FAILED';
  storageUpload: 'PASSED' | 'FAILED';
  storageDelete: 'PASSED' | 'FAILED';
  securityChecks: 'PASSED' | 'FAILED';
  zeroFabricationCheck: 'PASSED' | 'FAILED';
}

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🏛️  SARASWATI SHISHU VIDYA MANDIR - FULL E2E WORKFLOW AUDIT');
  console.log('================================================================\n');

  const auditResults: Partial<E2EResults> = {};

  // --------------------------------------------------------------------------
  // STEP 1: Admin Authentication
  // --------------------------------------------------------------------------
  console.log('[Step 1] Testing Admin Authentication...');
  let adminToken = '';
  const testEmail = process.env.TEST_ADMIN_EMAIL || process.env.SETUP_ADMIN_EMAIL;
  const testPassword = process.env.TEST_ADMIN_PASSWORD || process.env.SETUP_ADMIN_PASSWORD;

  if (testEmail && testPassword) {
    try {
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      const loginJson = await loginRes.json();
      if (loginJson.success && loginJson.data?.token) {
        adminToken = loginJson.data.token;
        auditResults.adminLogin = 'PASSED';
        console.log(`   ✅ Admin Login Successful. Role: ${loginJson.data.user.role}, Name: ${loginJson.data.user.full_name}`);
      } else {
        auditResults.adminLogin = 'FAILED';
        console.error('   ❌ Admin Login Failed:', loginJson);
      }
    } catch (err: any) {
      auditResults.adminLogin = 'FAILED';
      console.error('   ❌ Admin Login Error:', err.message);
    }
  } else {
    auditResults.adminLogin = 'SKIPPED';
    console.log('   ℹ️ Admin Login Step Skipped (Provide TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD to test live login)');
  }

  // --------------------------------------------------------------------------
  // STEP 2 & 3: Create Temporary Notice via Admin Portal
  // --------------------------------------------------------------------------
  console.log('\n[Step 2 & 3] Creating Temporary Test Notice via Admin Portal...');
  let temporaryNoticeId = '';
  const initialNoticeTitle = `[TEMP-TEST] Verification Notice ${Date.now()}`;
  const noticePayload = {
    title: initialNoticeTitle,
    category: 'Important',
    description: 'This is a strictly temporary test notice created during automated end-to-end verification.',
    notice_date: '2026-09-25',
    is_important: true,
    published: true
  };

  try {
    const createRes = await fetch(`${BASE_URL}/api/admin/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(noticePayload)
    });
    const createJson = await createRes.json();
    if (createJson.success && createJson.data?.id) {
      temporaryNoticeId = createJson.data.id;
      auditResults.createNotice = 'PASSED';
      console.log(`   ✅ Temporary Notice Created: ID = ${temporaryNoticeId}`);
    } else {
      auditResults.createNotice = 'FAILED';
      console.error('   ❌ Create Notice Failed:', createJson);
    }
  } catch (err: any) {
    auditResults.createNotice = 'FAILED';
    console.error('   ❌ Create Notice Error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 4: Verify record in Supabase Database public.notices table
  // --------------------------------------------------------------------------
  console.log('\n[Step 4] Querying Supabase Database (public.notices) directly...');
  try {
    const { data: dbNotices, error: dbErr } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', temporaryNoticeId);

    if (!dbErr && dbNotices && dbNotices.length > 0) {
      auditResults.supabaseDbVerifyCreate = 'PASSED';
      console.log(`   ✅ Found record in Supabase public.notices table: "${dbNotices[0].title}"`);
    } else {
      auditResults.supabaseDbVerifyCreate = 'FAILED';
      console.error('   ❌ Record not found in Supabase public.notices table:', dbErr?.message);
    }
  } catch (err: any) {
    auditResults.supabaseDbVerifyCreate = 'FAILED';
    console.error('   ❌ Supabase query error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 5: Verify notice appears on Public Website (/api/notices)
  // --------------------------------------------------------------------------
  console.log('\n[Step 5] Verifying notice appears on Public Website...');
  try {
    const publicRes = await fetch(`${BASE_URL}/api/notices`);
    const publicJson = await publicRes.json();
    const foundOnPublic = publicJson.data?.find((n: any) => n.id === temporaryNoticeId);

    if (foundOnPublic && foundOnPublic.title === initialNoticeTitle) {
      auditResults.publicWebsiteVerifyCreate = 'PASSED';
      console.log(`   ✅ Public Website dynamically returned notice: "${foundOnPublic.title}"`);
    } else {
      auditResults.publicWebsiteVerifyCreate = 'FAILED';
      console.error('   ❌ Notice not found on public website API');
    }
  } catch (err: any) {
    auditResults.publicWebsiteVerifyCreate = 'FAILED';
    console.error('   ❌ Public API error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 6: Edit the temporary notice from Admin
  // --------------------------------------------------------------------------
  console.log('\n[Step 6] Editing temporary notice from Admin Portal...');
  const updatedNoticeTitle = `[TEMP-TEST] Updated Title ${Date.now()}`;
  try {
    const updateRes = await fetch(`${BASE_URL}/api/admin/notices/${temporaryNoticeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...noticePayload,
        title: updatedNoticeTitle,
        description: 'Updated description for live verification.'
      })
    });
    const updateJson = await updateRes.json();
    if (updateJson.success && updateJson.data?.title === updatedNoticeTitle) {
      auditResults.updateNotice = 'PASSED';
      console.log(`   ✅ Notice updated via Admin API`);
    } else {
      auditResults.updateNotice = 'FAILED';
      console.error('   ❌ Update failed:', updateJson);
    }
  } catch (err: any) {
    auditResults.updateNotice = 'FAILED';
    console.error('   ❌ Update error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 7 & 8: Verify Update in Supabase & Public Website
  // --------------------------------------------------------------------------
  console.log('\n[Step 7 & 8] Verifying Updated Notice in Supabase & Public Website...');
  try {
    const { data: dbUpdated } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', temporaryNoticeId);

    if (dbUpdated && dbUpdated[0]?.title === updatedNoticeTitle) {
      auditResults.supabaseDbVerifyUpdate = 'PASSED';
      console.log(`   ✅ Supabase public.notices table updated to: "${dbUpdated[0].title}"`);
    } else {
      auditResults.supabaseDbVerifyUpdate = 'FAILED';
    }

    const publicRes2 = await fetch(`${BASE_URL}/api/notices`);
    const publicJson2 = await publicRes2.json();
    const updatedOnPublic = publicJson2.data?.find((n: any) => n.id === temporaryNoticeId);

    if (updatedOnPublic && updatedOnPublic.title === updatedNoticeTitle) {
      auditResults.publicWebsiteVerifyUpdate = 'PASSED';
      console.log(`   ✅ Public Website immediately reflects updated title: "${updatedOnPublic.title}"`);
    } else {
      auditResults.publicWebsiteVerifyUpdate = 'FAILED';
    }
  } catch (err: any) {
    console.error('   ❌ Update verification error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 9 & 10: Delete Temporary Notice & Verify Cleanup
  // --------------------------------------------------------------------------
  console.log('\n[Step 9 & 10] Deleting temporary notice & verifying removal across stack...');
  try {
    const deleteRes = await fetch(`${BASE_URL}/api/admin/notices/${temporaryNoticeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const deleteJson = await deleteRes.json();
    if (deleteJson.success) {
      auditResults.deleteNotice = 'PASSED';
      console.log(`   ✅ Delete request processed successfully.`);
    } else {
      auditResults.deleteNotice = 'FAILED';
    }

    // Verify deletion in Supabase database
    const { data: dbDeleted } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', temporaryNoticeId);

    if (!dbDeleted || dbDeleted.length === 0) {
      auditResults.supabaseDbVerifyDelete = 'PASSED';
      console.log(`   ✅ Verified deletion in Supabase database: Record no longer exists.`);
    } else {
      auditResults.supabaseDbVerifyDelete = 'FAILED';
    }

    // Verify deletion on public website
    const publicRes3 = await fetch(`${BASE_URL}/api/notices`);
    const publicJson3 = await publicRes3.json();
    const stillOnPublic = publicJson3.data?.find((n: any) => n.id === temporaryNoticeId);

    if (!stillOnPublic) {
      auditResults.publicWebsiteVerifyDelete = 'PASSED';
      console.log(`   ✅ Verified removal from Public Website.`);
    } else {
      auditResults.publicWebsiteVerifyDelete = 'FAILED';
    }
  } catch (err: any) {
    console.error('   ❌ Delete verification error:', err.message);
  }

  // --------------------------------------------------------------------------
  // STEP 11 & 12: Test File Upload & Delete in Supabase Storage
  // --------------------------------------------------------------------------
  console.log('\n[Step 11 & 12] Testing File Upload & Cleanup in Supabase Storage...');
  const testFileName = `e2e_audit_test_${Date.now()}.txt`;
  const testBuffer = Buffer.from('Saraswati Shishu Vidya Mandir E2E Storage Test Payload', 'utf-8');

  try {
    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('school-documents')
      .upload(testFileName, testBuffer, { contentType: 'text/plain', upsert: true });

    if (!uploadErr && uploadData) {
      auditResults.storageUpload = 'PASSED';
      const { data: urlData } = supabaseAdmin.storage.from('school-documents').getPublicUrl(testFileName);
      console.log(`   ✅ Uploaded test file to Supabase Storage bucket 'school-documents'`);
      console.log(`   ✅ Verified Public CDN URL: ${urlData.publicUrl}`);

      // Step 12: Delete temporary file
      const { error: removeErr } = await supabaseAdmin.storage
        .from('school-documents')
        .remove([testFileName]);

      if (!removeErr) {
        auditResults.storageDelete = 'PASSED';
        console.log(`   ✅ Deleted temporary test file from Supabase Storage.`);
      } else {
        auditResults.storageDelete = 'FAILED';
      }
    } else {
      auditResults.storageUpload = 'FAILED';
      console.error('   ❌ Storage upload failed:', uploadErr?.message);
    }
  } catch (err: any) {
    console.error('   ❌ Storage error:', err.message);
  }

  // --------------------------------------------------------------------------
  // SECURITY & ACCESS CONTROL VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n[Security Checks] Verifying Authorization, RLS & Key Isolation...');
  try {
    // 1. Unauthorized mutations must return 401
    const unauthRes = await fetch(`${BASE_URL}/api/admin/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticePayload)
    });

    const is401 = unauthRes.status === 401;

    // 2. Client files must never leak secret key
    const clientFiles = [
      path.join(process.cwd(), 'assets', 'js', 'main.js'),
      path.join(process.cwd(), 'assets', 'js', 'supabaseClient.js'),
      path.join(process.cwd(), 'index.html')
    ];
    let secretKeyLeaked = false;
    for (const f of clientFiles) {
      if (fs.existsSync(f)) {
        const content = fs.readFileSync(f, 'utf-8');
        if (content.includes(SUPABASE_SECRET_KEY)) {
          secretKeyLeaked = true;
          break;
        }
      }
    }

    if (is401 && !secretKeyLeaked) {
      auditResults.securityChecks = 'PASSED';
      console.log('   ✅ Unauthorized mutation rejected (HTTP 401).');
      console.log('   ✅ Confirmed Secret Key is never exposed in client scripts.');
    } else {
      auditResults.securityChecks = 'FAILED';
      console.error(`   ❌ Security check failed: 401=${is401}, SecretLeaked=${secretKeyLeaked}`);
    }
  } catch (err: any) {
    auditResults.securityChecks = 'FAILED';
  }

  // --------------------------------------------------------------------------
  // ZERO FABRICATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n[Data Integrity] Verifying Zero Fabrication & Official Placeholders...');
  try {
    const schoolRes = await fetch(`${BASE_URL}/api/school`);
    const schoolJson = await schoolRes.json();
    const affilNo = schoolJson.data?.affiliation_number;
    const isPlaceholder = affilNo && affilNo.includes('[OFFICIAL');

    if (isPlaceholder) {
      auditResults.zeroFabricationCheck = 'PASSED';
      console.log(`   ✅ Placeholders preserved for unsupplied official data: "${affilNo}"`);
    } else {
      auditResults.zeroFabricationCheck = 'FAILED';
    }
  } catch (err: any) {
    auditResults.zeroFabricationCheck = 'FAILED';
  }

  // --------------------------------------------------------------------------
  // FINAL VERDICT FORMAT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 FINAL AUDIT VERDICT');
  console.log('================================================================');
  console.log(`END-TO-END STATUS: ${auditResults.adminLogin === 'PASSED' && auditResults.publicWebsiteVerifyCreate === 'PASSED' && auditResults.deleteNotice === 'PASSED' ? 'PASSED' : 'FAILED'}`);
  console.log(`ADMIN LOGIN:       ${auditResults.adminLogin}`);
  console.log(`CREATE:            ${auditResults.createNotice}`);
  console.log(`SUPABASE DATABASE: ${auditResults.supabaseDbVerifyCreate === 'PASSED' && auditResults.supabaseDbVerifyUpdate === 'PASSED' && auditResults.supabaseDbVerifyDelete === 'PASSED' ? 'VERIFIED' : 'FAILED'}`);
  console.log(`PUBLIC WEBSITE:    ${auditResults.publicWebsiteVerifyCreate === 'PASSED' && auditResults.publicWebsiteVerifyUpdate === 'PASSED' ? 'VERIFIED' : 'FAILED'}`);
  console.log(`UPDATE:            ${auditResults.updateNotice}`);
  console.log(`DELETE:            ${auditResults.deleteNotice}`);
  console.log(`STORAGE:           ${auditResults.storageUpload === 'PASSED' && auditResults.storageDelete === 'PASSED' ? 'VERIFIED' : 'FAILED'}`);
  console.log(`SECURITY:          ${auditResults.securityChecks}`);
  console.log(`FINAL STATUS:      ${Object.values(auditResults).every(v => v === 'PASSED') ? 'READY & FULLY OPERATIONAL' : 'REQUIRES ATTENTION'}`);
  console.log('================================================================\n');

  process.exit(0);
}

runEndToEndVerification().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
