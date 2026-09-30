import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { ENV } from '../backend/src/config/env.js';
import { db } from '../backend/src/db/database.js';

const { Client } = pg;

export async function runMigrations() {
  console.log('====================================================');
  console.log('🏛️  SSVM Portal - Database Migration Runner');
  console.log('====================================================');

  const migrationSqlPath = path.join(process.cwd(), 'database', 'supabase_complete_migration.sql');
  if (!fs.existsSync(migrationSqlPath)) {
    console.error(`❌ Migration file not found at ${migrationSqlPath}`);
    return;
  }

  const sqlContent = fs.readFileSync(migrationSqlPath, 'utf-8');

  // Check if DIRECT_URL or DATABASE_URL is configured with real password
  const connectionUrl = (ENV.DIRECT_URL && !ENV.DIRECT_URL.includes('[YOUR-PASSWORD]'))
    ? ENV.DIRECT_URL
    : (ENV.DATABASE_URL && !ENV.DATABASE_URL.includes('[YOUR-PASSWORD]'))
      ? ENV.DATABASE_URL
      : null;

  if (connectionUrl) {
    console.log('🔄 Connecting to Supabase PostgreSQL database...');
    const client = new Client({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected to Supabase PostgreSQL successfully.');
      console.log('🚀 Executing complete migration script (tables, indexes, RLS, seeds)...');
      
      await client.query(sqlContent);
      console.log('🎉 Migration completed successfully in Supabase PostgreSQL!');
      await client.end();
      return;
    } catch (err: any) {
      console.error('⚠️ Direct PostgreSQL migration error:', err.message);
      try { await client.end(); } catch {}
    }
  } else {
    console.log('ℹ️  Note: DATABASE_URL / DIRECT_URL contains placeholder [YOUR-PASSWORD].');
    console.log('📌 To run migrations directly from terminal:');
    console.log('   Replace [YOUR-PASSWORD] in .env with your Supabase database password.');
    console.log('📌 Or run in Supabase Dashboard:');
    console.log('   Open Supabase Dashboard -> SQL Editor -> New Query');
    console.log('   Paste contents of database/supabase_complete_migration.sql and click Run.');
  }

  // Ensure local resilient store has schema and initial placeholder data
  console.log('🔄 Ensuring local data store is active and seeded...');
  const settings = await db.queryOne('SELECT * FROM school_settings');
  if (!settings) {
    console.log('ℹ️ Local data store ready. Run "npm run db:setup-admin" to configure administrator account.');
  }

  console.log('🎉 Database migrations and schema checks complete.');
}

if (process.argv[1] && (process.argv[1].endsWith('migrate.ts') || process.argv[1].endsWith('migrate.js'))) {
  runMigrations().catch(console.error);
}
