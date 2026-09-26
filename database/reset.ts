import fs from 'fs';
import path from 'path';
import { runMigrations } from './migrate.js';
import { runDatabaseSeed } from './seed.js';

export async function resetDatabase() {
  console.log('⚠️ Resetting database to clean default state...');

  const localDb = path.join(process.cwd(), 'storage', 'data_store.json');
  if (fs.existsSync(localDb)) {
    fs.unlinkSync(localDb);
    console.log('🧹 Removed local data_store.json');
  }

  await runMigrations();
  await runDatabaseSeed();
  console.log('🎉 Database reset and re-seeded successfully!');
}

if (process.argv[1] && (process.argv[1].endsWith('reset.ts') || process.argv[1].endsWith('reset.js'))) {
  resetDatabase().catch(console.error);
}
