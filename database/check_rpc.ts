import { createClient } from '@supabase/supabase-js';
import { ENV } from '../backend/src/config/env.js';

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_SECRET_KEY = ENV.SUPABASE_SECRET_KEY;

async function checkRpc() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1;' });
    console.log('RPC exec_sql result:', { data, error });
  } catch (e: any) {
    console.log('RPC catch:', e.message);
  }
}

checkRpc().catch(console.error);
