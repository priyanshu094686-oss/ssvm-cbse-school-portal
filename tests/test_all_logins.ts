import assert from 'assert';
import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../backend/src/server.js';
import { db } from '../backend/src/db/database.js';

const PORT = 8097;
const BASE_URL = `http://localhost:${PORT}`;

async function verifyAllAccounts() {
  console.log('🧪 VERIFYING ROLE-BASED ADMIN ACCOUNTS & PASSWORD AUTHENTICATION...\n');

  const testPassword = process.env.TEST_ROLE_PASSWORD || 'RoleTestPass2026!';
  const testHash = await bcrypt.hash(testPassword, 10);

  const testCases = [
    { email: 'test-superadmin@ssvm.internal', password: testPassword, role: 'SUPER_ADMIN' as const, name: 'Test Super Admin' },
    { email: 'test-manager@ssvm.internal', password: testPassword, role: 'ADMIN' as const, name: 'Test Manager' },
    { email: 'test-editor@ssvm.internal', password: testPassword, role: 'EDITOR' as const, name: 'Test Editor' },
    { email: 'test-viewer@ssvm.internal', password: testPassword, role: 'VIEWER' as const, name: 'Test Viewer' },
  ];

  const testUsers = testCases.map((tc, idx) => ({
    id: `usr-test-role-${idx + 1}`,
    email: tc.email,
    password_hash: testHash,
    full_name: tc.name,
    role: tc.role,
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  await db.saveTable('admin_users', testUsers);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));

  try {
    for (const tc of testCases) {
      console.log(`[Testing Login] ${tc.email} (${tc.role})...`);
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tc.email, password: tc.password })
      });
      const data: any = await res.json();
      assert.strictEqual(res.status, 200, `Login for ${tc.email} should return 200`);
      assert.strictEqual(data.success, true, `Login for ${tc.email} should succeed`);
      assert.strictEqual(data.data.user.role, tc.role, `Role should match ${tc.role}`);
      console.log(`  ✅ Login OK for ${tc.email}`);

      // Test auth/me
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.data.token}` }
      });
      const meData: any = await meRes.json();
      assert.strictEqual(meRes.status, 200, `/api/auth/me should return 200`);
      assert.strictEqual(meData.data.email, tc.email, `/api/auth/me email should match`);
      console.log(`  ✅ /api/auth/me profile OK for ${tc.email}`);

      // Test change-password with the correct current password
      const changeRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.data.token}`
        },
        body: JSON.stringify({
          current_password: tc.password,
          new_password: tc.password
        })
      });
      const changeData: any = await changeRes.json();
      assert.strictEqual(changeRes.status, 200, `Change password should return 200 for ${tc.email}`);
      assert.strictEqual(changeData.success, true, `Change password success should be true`);
      console.log(`  ✅ Password change verification OK for ${tc.email}\n`);
    }

    console.log('🎉 ALL ROLE ACCOUNTS PASSED LOGIN AND PASSWORD MANAGEMENT CHECKS 100%!');
  } finally {
    server.close();
  }
}

verifyAllAccounts().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
