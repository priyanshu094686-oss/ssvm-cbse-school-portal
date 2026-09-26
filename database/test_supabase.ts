import { createClient } from '@supabase/supabase-js';
import { ENV } from '../backend/src/config/env.js';

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_SECRET_KEY = ENV.SUPABASE_SECRET_KEY;
const SUPABASE_PUBLISHABLE_KEY = ENV.SUPABASE_PUBLISHABLE_KEY;

async function testSupabase() {
  console.log('🔗 Connecting to Supabase project:', SUPABASE_URL);

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Test Storage Buckets
  try {
    console.log('📦 Checking Storage Buckets...');
    const { data: buckets, error: bucketErr } = await supabaseAdmin.storage.listBuckets();
    if (bucketErr) {
      console.warn('⚠️ Storage list error:', bucketErr.message);
    } else {
      console.log('✅ Storage Buckets in project:', buckets.map(b => b.name));
    }
  } catch (e: any) {
    console.warn('Storage test caught:', e.message);
  }

  // 2. Test PostgREST / Table query
  try {
    console.log('📊 Testing Table Query via Supabase Client...');
    const { data, error } = await supabaseAdmin.from('school_settings').select('*').limit(1);
    if (error) {
      console.log('ℹ️ Table test response:', error.message, '(Code:', error.code, ')');
    } else {
      console.log('✅ Tables exist and accessible! Rows:', data);
    }
  } catch (e: any) {
    console.warn('Table test caught:', e.message);
  }

  // 3. Test Public Client
  try {
    console.log('🌐 Testing Client with Publishable Key...');
    const publicClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await publicClient.from('notices').select('*').limit(1);
    if (error) {
      console.log('ℹ️ Public client query note:', error.message);
    } else {
      console.log('✅ Public client query successful! Data:', data);
    }
  } catch (e: any) {
    console.warn('Public client caught:', e.message);
  }
}

testSupabase().catch(console.error);
