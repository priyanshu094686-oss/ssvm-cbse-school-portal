import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
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
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          return;
        }
        if (char === '\u0003') {
          stdin.setRawMode(false);
          stdout.write('\nOperation cancelled by user.\n');
          process.exit(1);
        }
        if (char === '\b' || char === '\x7f') {
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          return;
        }
        password += char;
        stdout.write('*');
      };

      stdin.on('data', onData);
    } else {
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

export async function runAuthDiagnosis(options?: { email?: string; password?: string }) {
  console.log('================================================================');
  console.log('🔍 ZERO-KNOWLEDGE AUTHENTICATION DIAGNOSTIC');
  console.log('================================================================\n');

  // Discover configured accounts
  const localUsers = db.getTable('admin_users') || [];
  let defaultEmail = localUsers.find(u => u.role === 'SUPER_ADMIN')?.email || localUsers[0]?.email || '';

  let targetEmail = options?.email || process.env.DIAG_ADMIN_EMAIL;
  if (!targetEmail) {
    if (defaultEmail) {
      const input = await askLineInput(`Admin Email [default: ${defaultEmail}]: `);
      targetEmail = input || defaultEmail;
    } else {
      targetEmail = await askLineInput('Admin Email: ');
    }
  }

  targetEmail = targetEmail.toLowerCase().trim();

  // Ask for password to verify
  let testPassword = options?.password || process.env.DIAG_TEST_PASSWORD;
  if (!testPassword) {
    testPassword = await askMaskedInput('Password to test (masked): ');
  }

  console.log('\n--- DIAGNOSTIC RESULTS ---');

  // 1. Account Found & Active & Role in Local Store
  const localUser = localUsers.find(u => u.email?.toLowerCase() === targetEmail);
  const isAccountFound = Boolean(localUser);
  const isActive = Boolean(localUser?.is_active);
  const role = localUser?.role || 'N/A';

  console.log(`Account Found:          ${isAccountFound ? 'YES' : 'NO'}`);
  console.log(`Active:                 ${isActive ? 'YES' : 'NO'}`);
  console.log(`Role:                   ${role}`);

  // 2. Remote Store & Local/Supabase Parity
  let isParity = 'N/A (Local Only)';
  let remoteUser: any = null;

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('admin_users').select('*').eq('email', targetEmail);
      if (!error && data && data.length > 0) {
        remoteUser = data[0];
        if (localUser) {
          const hashMatch = localUser.password_hash === remoteUser.password_hash;
          const roleMatch = localUser.role === remoteUser.role;
          const activeMatch = localUser.is_active === remoteUser.is_active;
          isParity = (hashMatch && roleMatch && activeMatch) ? 'YES' : 'NO (Parity Mismatch)';
        }
      } else {
        isParity = 'NO (Not Found in Supabase)';
      }
    } catch {
      isParity = 'ERROR (Supabase Query Failed)';
    }
  }

  console.log(`Local/Supabase Parity:  ${isParity}`);

  // 3. Bcrypt Verification
  let bcryptMatch = false;
  if (localUser && localUser.password_hash && testPassword) {
    bcryptMatch = await bcrypt.compare(testPassword, localUser.password_hash);
  }

  console.log(`Bcrypt Verification:    ${bcryptMatch ? 'MATCH' : 'NO_MATCH'}`);

  // 4. Live HTTP Login Test (http://localhost:4000/api/auth/login)
  let liveHttpResult = 'FAIL';
  try {
    const liveRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        password: testPassword
      }),
      signal: AbortSignal.timeout(3000)
    });

    const liveJson: any = await liveRes.json();
    if (liveRes.status === 200 && liveJson.success === true) {
      liveHttpResult = 'SUCCESS (HTTP 200)';
    } else {
      liveHttpResult = `FAIL (HTTP ${liveRes.status} - ${liveJson.error?.message || 'Unauthorized'})`;
    }
  } catch (err: any) {
    liveHttpResult = `FAIL (Connection Error: Server may not be running on port 4000)`;
  }

  console.log(`Live HTTP Login:        ${liveHttpResult}`);
  console.log('================================================================\n');

  return {
    accountFound: isAccountFound,
    active: isActive,
    role,
    parity: isParity,
    bcrypt: bcryptMatch,
    liveLogin: liveHttpResult.startsWith('SUCCESS')
  };
}

if (process.argv[1] && (process.argv[1].endsWith('diagnose_auth.ts') || process.argv[1].endsWith('diagnose_auth.js'))) {
  runAuthDiagnosis()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Diagnosis error:', err.message);
      process.exit(1);
    });
}
