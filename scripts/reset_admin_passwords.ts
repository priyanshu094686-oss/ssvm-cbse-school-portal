import { setupSuperAdmin } from './setup_admin.js';

if (process.argv[1] && (process.argv[1].endsWith('reset_admin_passwords.ts') || process.argv[1].endsWith('reset_admin_passwords.js'))) {
  setupSuperAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reset error:', err.message);
      process.exit(1);
    });
}
