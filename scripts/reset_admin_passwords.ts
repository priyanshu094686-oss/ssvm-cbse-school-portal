import bcrypt from 'bcryptjs';
import { db, supabaseAdmin } from '../backend/src/db/database.js';

async function resetAdminPasswords() {
  console.log('🔄 Resetting and standardizing admin credentials in local store & Supabase...');

  const users = [
    {
      id: 'usr-super-admin-01',
      email: 'admin@ssvm.edu.in',
      password_hash: await bcrypt.hash('Admin@SSVM2026!', 10),
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
      password_hash: await bcrypt.hash('Manager@SSVM2026!', 10),
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
      password_hash: await bcrypt.hash('Editor@SSVM2026!', 10),
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
      password_hash: await bcrypt.hash('Viewer@SSVM2026!', 10),
      full_name: 'Audit & Compliance Viewer',
      role: 'VIEWER',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  await db.saveTable('admin_users', users);

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('admin_users').upsert(users, { onConflict: 'email' });
      if (error) {
        console.error('Supabase upsert error:', error.message);
      } else {
        console.log('✅ Supabase admin_users synced successfully.');
      }
    } catch (e) {
      console.warn('Supabase sync warning:', e);
    }
  }

  console.log('\n--- VERIFYING PASSWORDS ---');
  const stored = db.getTable('admin_users');
  for (const u of stored) {
    console.log(`User: ${u.email} (${u.role})`);
    if (u.email === 'admin@ssvm.edu.in') {
      console.log('  Admin@SSVM2026! matches:', await bcrypt.compare('Admin@SSVM2026!', u.password_hash));
    }
    if (u.email === 'manager@ssvm.edu.in') {
      console.log('  Manager@SSVM2026! matches:', await bcrypt.compare('Manager@SSVM2026!', u.password_hash));
    }
    if (u.email === 'editor@ssvm.edu.in') {
      console.log('  Editor@SSVM2026! matches:', await bcrypt.compare('Editor@SSVM2026!', u.password_hash));
    }
    if (u.email === 'viewer@ssvm.edu.in') {
      console.log('  Viewer@SSVM2026! matches:', await bcrypt.compare('Viewer@SSVM2026!', u.password_hash));
    }
  }

  console.log('\n🎉 Password reset completed successfully.');
  process.exit(0);
}

resetAdminPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
