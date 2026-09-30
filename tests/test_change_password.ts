import assert from 'assert';
import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../backend/src/server.js';
import { db } from '../backend/src/db/database.js';
import { runDatabaseSeed } from '../database/seed.js';

const PORT = 8094;
const BASE_URL = `http://localhost:${PORT}`;

async function runChangePasswordVerification() {
  console.log('================================================================');
  console.log('🔐 VERIFYING ADMIN PASSWORD CHANGE & RBAC SECURITY LIFECYCLE');
  console.log('================================================================\n');

  await runDatabaseSeed();

  const testAdminEmail = process.env.TEST_CHANGE_PWD_EMAIL || 'test-manager@ssvm.internal';
  const originalPassword = process.env.TEST_ORIGINAL_PWD || 'OriginalManagerPass2026!';
  const temporaryNewPassword = 'Secured#NewManager2026!';

  const originalHash = await bcrypt.hash(originalPassword, 10);
  const testUser = {
    id: 'usr-test-manager',
    email: testAdminEmail,
    password_hash: originalHash,
    full_name: 'Test School Manager',
    role: 'ADMIN',
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await db.saveTable('admin_users', [testUser]);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));

  try {
    // 1. Initial Login with current password
    console.log('[Step 1] Logging in with current manager credentials...');
    const login1Res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: originalPassword })
    });
    const login1Json: any = await login1Res.json();
    assert.strictEqual(login1Res.status, 200, 'Initial login should succeed');
    assert.strictEqual(login1Json.success, true, 'Login response should be successful');
    const token = login1Json.data.token;
    console.log('✅ Initial login successful.');

    // 2. Change password via authenticated POST /api/auth/change-password
    console.log('\n[Step 2] Changing password via POST /api/auth/change-password...');
    const changeRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        current_password: originalPassword,
        new_password: temporaryNewPassword
      })
    });
    const changeJson: any = await changeRes.json();
    assert.strictEqual(changeRes.status, 200, 'Password change request should succeed (200)');
    assert.strictEqual(changeJson.success, true, 'Password change response should have success: true');
    console.log('✅ Password changed successfully in database.');

    // 3. Verify Requirement 1: Old password no longer works
    console.log('\n[Step 3] Verifying Requirement 1: Old password no longer works...');
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: originalPassword })
    });
    const oldLoginJson: any = await oldLoginRes.json();
    assert.strictEqual(oldLoginRes.status, 401, 'Old password should be rejected with 401');
    assert.strictEqual(oldLoginJson.success, false, 'Old password login should fail');
    console.log('✅ Requirement 1 Verified: Old password rejected with 401 Unauthorized.');

    // 4. Verify Requirement 2: New password works
    console.log('\n[Step 4] Verifying Requirement 2: New password works...');
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: temporaryNewPassword })
    });
    const newLoginJson: any = await newLoginRes.json();
    assert.strictEqual(newLoginRes.status, 200, 'New password login should succeed with 200');
    assert.strictEqual(newLoginJson.success, true, 'New password login should return success');
    assert.ok(newLoginJson.data.token, 'New password login should return a valid JWT token');
    const newToken = newLoginJson.data.token;
    console.log('✅ Requirement 2 Verified: New password logged in successfully with valid session token.');

    // 5. Verify Requirement 3: Unauthenticated admin API requests return 401
    console.log('\n[Step 5] Verifying Requirement 3: Unauthenticated admin API requests return 401...');
    const unauthRes = await fetch(`${BASE_URL}/api/admin/stats`);
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request should return 401 Unauthorized');
    console.log('✅ Requirement 3 Verified: Unauthenticated requests strictly return 401.');

    // 6. Verify Requirement 4: Authorized access works with new token
    console.log('\n[Step 6] Verifying Requirement 4: Authorized admin access works with new token...');
    const authRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    const authJson: any = await authRes.json();
    assert.strictEqual(authRes.status, 200, 'Authorized request should return 200');
    assert.strictEqual(authJson.success, true, 'Admin stats should be accessible with new token');
    console.log('✅ Requirement 4 Verified: Authorized access to admin dashboard verified.');

    // 7. Reset back to clean password
    console.log('\n[Step 7] Restoring original password...');
    const restoreRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        current_password: temporaryNewPassword,
        new_password: originalPassword
      })
    });
    assert.strictEqual(restoreRes.status, 200, 'Password restored');
    console.log('✅ Account restored to clean state.');

    console.log('\n================================================================');
    console.log('🎉 ALL 4 PASSWORD CHANGE VERIFICATION REQUIREMENTS PASSED');
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

runChangePasswordVerification().catch(err => {
  console.error('\n❌ Verification Error:', err);
  process.exit(1);
});
