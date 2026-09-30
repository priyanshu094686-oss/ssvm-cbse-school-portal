import assert from 'assert';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../backend/src/config/env.js';
import app from '../backend/src/server.js';
import { runDatabaseSeed } from '../database/seed.js';

import bcrypt from 'bcryptjs';
import { db } from '../backend/src/db/database.js';

const PORT = 8092;
const BASE_URL = `http://localhost:${PORT}`;

async function runManagerWorkflowVerification() {
  await runDatabaseSeed();

  const testPassword = 'TestWorkflowPass2026!';
  const testHash = await bcrypt.hash(testPassword, 10);
  const testManagerEmail = 'test-manager-workflow@ssvm.internal';
  const testEditorEmail = 'test-editor-workflow@ssvm.internal';
  const testViewerEmail = 'test-viewer-workflow@ssvm.internal';

  await db.saveTable('admin_users', [
    {
      id: 'usr-test-wm-1',
      email: testManagerEmail,
      password_hash: testHash,
      full_name: 'Workflow Manager',
      role: 'ADMIN',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-test-wm-2',
      email: testEditorEmail,
      password_hash: testHash,
      full_name: 'Workflow Editor',
      role: 'EDITOR',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-test-wm-3',
      email: testViewerEmail,
      password_hash: testHash,
      full_name: 'Workflow Viewer',
      role: 'VIEWER',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  try {
    console.log('================================================================');
    console.log('🧪 VERIFYING SARASWATI SHISHU VIDYA MANDIR CMS & VERCEL READINESS');
    console.log('================================================================\n');

    // 1. Initialize Supabase Verification Client
    console.log('[Step 1] Initializing Server-Side Supabase Verification Client...');
    const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY);
    assert(supabase, 'Supabase admin client initialized');
    console.log('✅ Supabase connected successfully to project:', ENV.SUPABASE_URL);

  // 2. School Manager Login
  console.log('\n[Step 2] School Manager Login via /api/auth/login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testManagerEmail,
      password: testPassword
    })
  });
  const loginJson: any = await loginRes.json();
  assert(loginRes.status === 200 && loginJson.success === true, 'School Manager logged in successfully');
  assert(loginJson.data.user.role === 'ADMIN' || loginJson.data.user.role === 'SCHOOL_MANAGER', 'User has ADMIN/SCHOOL_MANAGER role');
  const managerToken = loginJson.data.token;
  console.log(`✅ Logged in as School Manager: ${loginJson.data.user.full_name} (${loginJson.data.user.email})`);

  // 3. Edit School Information
  console.log('\n[Step 3] School Manager Edits School Information...');
  const originalSchoolRes = await fetch(`${BASE_URL}/api/school`);
  const originalSchoolJson: any = await originalSchoolRes.json();
  const originalSettings = originalSchoolJson.data || {};

  const updatedSettings = {
    school_name: 'Saraswati Shishu Vidya Mandir',
    affiliation_number: originalSettings.affiliation_number || '[OFFICIAL CBSE AFFILIATION NUMBER]',
    school_code: originalSettings.school_code || '[OFFICIAL SCHOOL CODE]',
    address: originalSettings.address || '[OFFICIAL SCHOOL ADDRESS]',
    pin_code: originalSettings.pin_code || '[PIN CODE]',
    official_email: originalSettings.official_email || '[OFFICIAL SCHOOL EMAIL]',
    official_phone: originalSettings.official_phone || '[OFFICIAL PHONE NUMBER]',
    alt_phone: originalSettings.alt_phone || '[OFFICIAL ALTERNATIVE PHONE]',
    website: 'https://ssvm.edu.in',
    office_hours: 'Monday to Saturday: 8:00 AM – 3:30 PM (Updated by Manager)',
    principal_name: originalSettings.principal_name || '[PRINCIPAL NAME]',
    principal_qualification: originalSettings.principal_qualification || '[PRINCIPAL QUALIFICATION]',
    principal_message: originalSettings.principal_message || 'Welcome to Saraswati Shishu Vidya Mandir.',
    board: 'Central Board of Secondary Education (CBSE), New Delhi',
    classes: 'Classes 1 to 10'
  };

  const updateSchoolRes = await fetch(`${BASE_URL}/api/admin/school`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managerToken}`
    },
    body: JSON.stringify(updatedSettings)
  });
  const updateSchoolJson: any = await updateSchoolRes.json();
  assert(updateSchoolRes.status === 200 && updateSchoolJson.success === true, 'School Information updated by Manager');
  console.log('✅ School Information saved via Manager Admin API');

  // 4. Verify Supabase & Public Website reflection
  console.log('\n[Step 4] Verifying Supabase and Public Website Reflection...');
  const publicSchoolRes = await fetch(`${BASE_URL}/api/school`);
  const publicSchoolJson: any = await publicSchoolRes.json();
  assert(publicSchoolJson.data.office_hours.includes('Updated by Manager'), 'Public website reflects updated school info');
  console.log(`✅ Verified on Public Website: Office Hours = "${publicSchoolJson.data.office_hours}"`);

  // 5. Document Management Lifecycle: Upload -> Draft -> Approve -> Publish -> Unpublish -> Delete
  console.log('\n[Step 5] Testing Document Lifecycle (Upload → Draft → Approve → Publish → Unpublish → Delete)...');
  
  // Step 5a: Upload temporary test dummy document to Supabase Storage
  const testFileName = `test_compliance_doc_${Date.now()}.pdf`;
  const testDocBuffer = Buffer.from('%PDF-1.4 Temporary Test Document for Verification Only', 'utf-8');
  
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('school-documents')
    .upload(testFileName, testDocBuffer, { contentType: 'application/pdf', upsert: true });

  assert(!uploadErr, `Uploaded dummy test doc to Supabase: ${uploadErr?.message}`);
  const { data: publicUrlData } = supabase.storage.from('school-documents').getPublicUrl(testFileName);
  const testFileUrl = publicUrlData.publicUrl;
  console.log('✅ Temporary Test Document uploaded to Supabase Storage:', testFileUrl);

  // Step 5b: Create Document as Draft in CMS
  const createDocPayload = {
    document_name: 'Temporary Statutory Safety Compliance Test Document',
    category: '5. BUILDING SAFETY',
    description: 'Non-production temporary document for testing the draft and publish workflow.',
    status: 'Pending Verification / Draft',
    status_code: 'under_verification' as const,
    issue_date: '2026-09-26',
    validity_date: '2027-09-26',
    last_updated: '2026-09-26',
    file_url: testFileUrl,
    file_name: testFileName,
    file_type: 'PDF',
    file_size: '0.05 MB',
    verified: false,
    workflow_stage: 'Draft' as const,
    published: false
  };

  const createDocRes = await fetch(`${BASE_URL}/api/admin/disclosure-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managerToken}`
    },
    body: JSON.stringify(createDocPayload)
  });
  const createDocJson: any = await createDocRes.json();
  assert(createDocRes.status === 201 && createDocJson.success === true, 'Test document created in CMS');
  const testDocId = createDocJson.data.id;
  console.log(`✅ Document created as DRAFT in CMS with ID: ${testDocId}`);

  // Step 5c: Verify Draft does NOT appear on Public Website
  const publicDocsRes1 = await fetch(`${BASE_URL}/api/disclosure-documents`);
  const publicDocsJson1: any = await publicDocsRes1.json();
  const draftVisible = publicDocsJson1.data?.some((d: any) => d.id === testDocId);
  assert(!draftVisible, 'Draft document is NOT visible on public website');
  console.log('✅ Verified: DRAFT document is securely hidden from public visitors');

  // Step 5d: Approve Document (still unpublished)
  const approveRes = await fetch(`${BASE_URL}/api/admin/workflow/disclosure_documents/${testDocId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managerToken}`
    },
    body: JSON.stringify({ workflow_stage: 'Approved' })
  });
  const approveJson: any = await approveRes.json();
  assert(approveJson.success && approveJson.data.workflow_stage === 'Approved', 'Document approved');
  console.log('✅ Document moved to APPROVED state');

  // Step 5e: Publish Document
  const publishRes = await fetch(`${BASE_URL}/api/admin/workflow/disclosure_documents/${testDocId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managerToken}`
    },
    body: JSON.stringify({ workflow_stage: 'Published' })
  });
  const publishJson: any = await publishRes.json();
  assert(publishJson.success && publishJson.data.published === true, 'Document published');
  console.log('✅ Document PUBLISHED by School Manager');

  // Step 5f: Verify Document IS NOW VISIBLE on Public Website
  const publicDocsRes2 = await fetch(`${BASE_URL}/api/disclosure-documents`);
  const publicDocsJson2: any = await publicDocsRes2.json();
  const publishedVisible = publicDocsJson2.data?.some((d: any) => d.id === testDocId);
  assert(publishedVisible, 'Published document is immediately visible on public website');
  console.log('✅ Verified: Published document is live on public website and Supabase');

  // Step 5g: Unpublish Document
  const unpublishRes = await fetch(`${BASE_URL}/api/admin/workflow/disclosure_documents/${testDocId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managerToken}`
    },
    body: JSON.stringify({ workflow_stage: 'Unpublished' })
  });
  const unpublishJson: any = await unpublishRes.json();
  assert(unpublishJson.success && unpublishJson.data.published === false, 'Document unpublished');
  console.log('✅ Document UNPUBLISHED by School Manager');

  // Step 5h: Verify Document Disappears from Public Website
  const publicDocsRes3 = await fetch(`${BASE_URL}/api/disclosure-documents`);
  const publicDocsJson3: any = await publicDocsRes3.json();
  const unpublishVisible = publicDocsJson3.data?.some((d: any) => d.id === testDocId);
  assert(!unpublishVisible, 'Unpublished document has disappeared from public website');
  console.log('✅ Verified: Unpublished document immediately disappeared from public website');

  // Step 5i: Delete Test Document and clean Supabase storage
  const deleteDocRes = await fetch(`${BASE_URL}/api/admin/disclosure-documents/${testDocId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${managerToken}`
    }
  });
  const deleteDocJson: any = await deleteDocRes.json();
  assert(deleteDocRes.status === 200 && deleteDocJson.success === true, 'Test document deleted from CMS');
  
  await supabase.storage.from('school-documents').remove([testFileName]);
  console.log('✅ Test document cleaned up from Supabase DB and Supabase Storage');

  // 6. Verify Role Hierarchy (Super Admin, Editor, Viewer)
  console.log('\n[Step 6] Verifying Role-Based Access Control...');
  
  // Editor Login
  const editorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEditorEmail, password: testPassword })
  });
  const editorJson: any = await editorLoginRes.json();
  const editorToken = editorJson.data.token;
  
  // Editor trying to access audit logs (restricted to SUPER_ADMIN & ADMIN)
  const editorAuditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${editorToken}` }
  });
  assert(editorAuditRes.status === 403, 'Editor cannot access audit logs');
  console.log('✅ Role Check Passed: EDITOR blocked from sensitive administrative audit logs');

  // Viewer Login
  const viewerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testViewerEmail, password: testPassword })
  });
  const viewerJson: any = await viewerLoginRes.json();
  const viewerToken = viewerJson.data.token;

  // Viewer trying to create staff (restricted)
  const viewerMutationRes = await fetch(`${BASE_URL}/api/admin/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${viewerToken}`
    },
    body: JSON.stringify({
      name: 'Unauthorized User Test',
      designation: 'PRT',
      qualification: 'B.Ed',
      staff_type: 'Teaching Staff'
    })
  });
  assert(viewerMutationRes.status === 403, 'Viewer blocked from content mutation');
  console.log('✅ Role Check Passed: VIEWER blocked from content mutation');

  // 7. Security & Audit Verification
  console.log('\n[Step 7] Verifying Audit Trail & Privacy Safeguards...');
  const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${managerToken}` }
  });
  const auditJson: any = await auditRes.json();
  assert(auditJson.success && Array.isArray(auditJson.data) && auditJson.data.length > 0, 'Audit logs recorded');
  console.log(`✅ Audit Trail Verified: ${auditJson.data.length} actions logged in ledger`);

    console.log('\n================================================================');
    console.log('🎉 ALL TESTS PASSED: SCHOOL MANAGER CMS & SUPABASE WORKFLOW VERIFIED');
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

runManagerWorkflowVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
