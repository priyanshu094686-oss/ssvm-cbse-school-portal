import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('Testing PostgREST reads...');
  const { data: settings, error: err1 } = await supabase.from('school_settings').select('*');
  console.log('Settings:', settings?.length, err1?.message);

  const { data: staff, error: err2 } = await supabase.from('staff').select('*');
  console.log('Staff:', staff?.length, err2?.message);

  const { data: notices, error: err3 } = await supabase.from('notices').select('*');
  console.log('Notices:', notices?.length, err3?.message);

  const { data: docs, error: err4 } = await supabase.from('disclosure_documents').select('*');
  console.log('Documents:', docs?.length, err4?.message);

  process.exit(0);
}

main();
