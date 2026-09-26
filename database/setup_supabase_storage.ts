import { createClient } from '@supabase/supabase-js';
import { ENV } from '../backend/src/config/env.js';

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_SECRET_KEY = ENV.SUPABASE_SECRET_KEY;

const BUCKETS = [
  'school-documents',
  'notices',
  'gallery',
  'staff',
  'achievements',
  'calendar',
  'forms',
  'transfer-certificates'
];

async function initSupabaseStorage() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  console.log('🚀 Initializing Supabase Storage Buckets...');

  for (const bucket of BUCKETS) {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
      if (error.message?.includes('already exists')) {
        console.log(`  ℹ️ Bucket '${bucket}' already exists.`);
      } else {
        console.warn(`  ⚠️ Failed to create bucket '${bucket}':`, error.message);
      }
    } else {
      console.log(`  ✅ Created public bucket '${bucket}'.`);
    }
  }

  const { data: currentBuckets } = await supabase.storage.listBuckets();
  console.log('\n📦 Current Supabase Storage Buckets:');
  currentBuckets?.forEach(b => console.log(`  - ${b.name} (public: ${b.public})`));
}

initSupabaseStorage().catch(console.error);
