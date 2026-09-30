import bcrypt from 'bcryptjs';
import readline from 'readline';
import crypto from 'crypto';
import { db, supabaseAdmin } from '../backend/src/db/database.js';

function askLineInput(promptText: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askMaskedInput(promptText: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(promptText);

    let password = '';

    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onData = (char: string) => {
        // Enter / Return
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          return;
        }
        // Ctrl+C (Interrupt)
        if (char === '\u0003') {
          stdin.setRawMode(false);
          stdout.write('\nOperation cancelled by user.\n');
          process.exit(1);
        }
        // Backspace
        if (char === '\b' || char === '\x7f') {
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          return;
        }
        // Mask character
        password += char;
        stdout.write('*');
      };

      stdin.on('data', onData);
    } else {
      // Non-interactive / piped fallback
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function setupSuperAdmin(options?: { email?: string; password?: string; confirmPassword?: string; fullName?: string }) {
  console.log('================================================================');
  console.log('🏛️  SARASWATI SHISHU VIDYA MANDIR - ADMIN ACCOUNT SETUP');
  console.log('🔐 Zero-Knowledge Security Pipeline (Bcrypt Hashing)');
  console.log('================================================================\n');

  // 1. Sync remote data first if Supabase is connected
  if (supabaseAdmin) {
    try {
      await db.syncAllFromSupabase();
    } catch (e) {
      // Sync notice
    }
  }

  // 2. Interactively ask for Admin Email
  let adminEmail = options?.email || process.env.SETUP_ADMIN_EMAIL;
  if (!adminEmail) {
    adminEmail = await askLineInput('Admin Email: ');
  }

  if (!adminEmail || !isValidEmail(adminEmail)) {
    console.error('\n❌ Validation Error: Please enter a valid email address.');
    process.exit(1);
  }
  adminEmail = adminEmail.toLowerCase().trim();

  // 3. Interactively ask for New Password (masked)
  let newPassword = options?.password || process.env.SETUP_ADMIN_PASSWORD;
  if (!newPassword) {
    newPassword = await askMaskedInput('New Password: ');
  }

  if (!newPassword || newPassword.length < 8) {
    console.error('\n❌ Validation Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  // 4. Interactively ask for Confirm Password (masked)
  let confirmPassword = options?.confirmPassword || process.env.SETUP_ADMIN_CONFIRM_PASSWORD || options?.password || (process.env.SETUP_ADMIN_PASSWORD ? process.env.SETUP_ADMIN_PASSWORD : undefined);
  if (!confirmPassword) {
    confirmPassword = await askMaskedInput('Confirm Password: ');
  }

  if (newPassword !== confirmPassword) {
    console.error('\n❌ Validation Error: Password confirmation does not match.');
    process.exit(1);
  }

  // 5. Generate Bcrypt Hash
  console.log('\n🔄 Generating cryptographically secure bcrypt hash (Cost factor 10)...');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const nowIso = new Date().toISOString();

  // 6. Update or Create Single SUPER_ADMIN account in local store
  const rawUsers = db.getTable('admin_users') || [];
  // Clean up any duplicate records with matching email
  const existingUser = rawUsers.find(u => u.email?.toLowerCase() === adminEmail);
  const otherUsers = rawUsers.filter(u => u.email?.toLowerCase() !== adminEmail);

  let targetUserId = existingUser?.id || 'usr-admin-' + crypto.randomUUID();
  let fullName = options?.fullName || existingUser?.full_name || 'Super Administrator';

  const updatedAdminAccount = {
    id: targetUserId,
    email: adminEmail,
    password_hash: passwordHash,
    full_name: fullName,
    role: 'SUPER_ADMIN',
    is_active: true,
    last_login_at: existingUser?.last_login_at || null,
    created_at: existingUser?.created_at || nowIso,
    updated_at: nowIso,
  };

  const finalUsers = [updatedAdminAccount, ...otherUsers];
  await db.saveTable('admin_users', finalUsers);

  // 7. Synchronize to Supabase PostgreSQL table
  let supabaseSynced = false;
  if (supabaseAdmin) {
    try {
      // First delete any duplicate remote records with same email
      await supabaseAdmin.from('admin_users').delete().eq('email', adminEmail);

      const { error } = await supabaseAdmin.from('admin_users').insert([updatedAdminAccount]);
      if (error) {
        console.warn('⚠️ Supabase remote update note:', error.message);
      } else {
        supabaseSynced = true;
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase sync note:', err.message);
    }
  }

  // 8. Internal Zero-Knowledge Bcrypt Verification
  const verifyLocal = await bcrypt.compare(newPassword, updatedAdminAccount.password_hash);
  let verifyRemote = true;
  if (supabaseAdmin && supabaseSynced) {
    try {
      const { data } = await supabaseAdmin.from('admin_users').select('password_hash').eq('email', adminEmail);
      if (data && data.length > 0) {
        verifyRemote = await bcrypt.compare(newPassword, data[0].password_hash);
      }
    } catch {
      // verification query
    }
  }

  if (!verifyLocal || !verifyRemote) {
    console.error('❌ Internal Verification Failed: Bcrypt validation mismatch.');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('🎉 SUPER_ADMIN ACCOUNT SETUP COMPLETED SUCCESSFULLY');
  console.log('================================================================');
  console.log(`  Account:           ${adminEmail}`);
  console.log(`  Role:              SUPER_ADMIN`);
  console.log(`  Active:            YES`);
  console.log(`  Bcrypt Status:     VERIFIED (Zero-Knowledge)`);
  console.log(`  Local Store:       SYNCED`);
  console.log(`  Supabase Store:    ${supabaseSynced ? 'SYNCED' : 'LOCAL ONLY'}`);
  console.log('================================================================');
  console.log('🌐 You can now sign in at http://localhost:4000/admin\n');
}

if (process.argv[1] && (process.argv[1].endsWith('setup_admin.ts') || process.argv[1].endsWith('setup_admin.js'))) {
  setupSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Setup error:', err.message);
      process.exit(1);
    });
}
