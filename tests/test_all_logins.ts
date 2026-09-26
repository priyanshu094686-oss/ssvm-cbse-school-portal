import assert from 'assert';
import http from 'http';
import app from '../backend/src/server.js';

const PORT = 8097;
const BASE_URL = `http://localhost:${PORT}`;

async function verifyAllAccounts() {
  console.log('🧪 VERIFYING ALL ADMIN ACCOUNTS & PASSWORD AUTHENTICATION...\n');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));

  try {
    const testCases = [
      { email: 'admin@ssvm.edu.in', password: 'Admin@SSVM2026!', role: 'SUPER_ADMIN' },
      { email: 'manager@ssvm.edu.in', password: 'Manager@SSVM2026!', role: 'ADMIN' },
      { email: 'editor@ssvm.edu.in', password: 'Editor@SSVM2026!', role: 'EDITOR' },
      { email: 'viewer@ssvm.edu.in', password: 'Viewer@SSVM2026!', role: 'VIEWER' },
    ];

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
          new_password: tc.password // Keep same password so it remains valid
        })
      });
      const changeData: any = await changeRes.json();
      assert.strictEqual(changeRes.status, 200, `Change password should return 200 for ${tc.email}`);
      assert.strictEqual(changeData.success, true, `Change password success should be true`);
      console.log(`  ✅ Password change verification OK for ${tc.email}\n`);
    }

    console.log('🎉 ALL 4 ACCOUNTS PASSED LOGIN AND PASSWORD MANAGEMENT CHECKS 100%!');
  } finally {
    server.close();
  }
}

verifyAllAccounts().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
