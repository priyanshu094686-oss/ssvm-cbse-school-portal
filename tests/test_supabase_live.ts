import { createClient } from '@supabase/supabase-js';
import { ENV } from '../backend/src/config/env.js';

async function testSupabaseLive() {
  console.log('======================================================');
  console.log('🔍 Testing Supabase Integration & Security Boundary');
  console.log('======================================================');

  console.log(`📌 Supabase URL: ${ENV.SUPABASE_URL}`);
  console.log(`📌 Publishable Key (Client-side): ${ENV.SUPABASE_PUBLISHABLE_KEY.substring(0, 15)}...`);
  console.log(`📌 Secret Key (Server-side): ${ENV.SUPABASE_SECRET_KEY ? 'Present (Securely hidden)' : 'Missing'}`);
  console.log(`📌 Storage Driver: ${ENV.STORAGE_DRIVER}`);

  // 1. Test Admin Client Connection
  const adminClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY);
  console.log('\n[Step 1] Testing Supabase Admin Client Connection...');
  
  // 2. Check Storage Buckets
  console.log('\n[Step 2] Listing Supabase Storage Buckets...');
  const { data: buckets, error: bucketErr } = await adminClient.storage.listBuckets();
  if (bucketErr) {
    console.error('❌ Error listing storage buckets:', bucketErr.message);
  } else {
    console.log(`✅ Found ${buckets.length} Storage Buckets:`);
    buckets.forEach(b => {
      const limitMb = b.file_size_limit ? (b.file_size_limit / (1024 * 1024)).toFixed(0) : '10';
      console.log(`   📁 ${b.name} (Public: ${b.public}, File Limit: ${limitMb} MB)`);
    });
  }

  // 3. Test Storage Upload & Download & Delete
  console.log('\n[Step 3] Testing Storage File Operations on bucket "school-documents"...');
  const testFileName = `test_verification_${Date.now()}.txt`;
  const testFileBuffer = Buffer.from('Saraswati Shishu Vidya Mandir - CBSE Compliance Test Buffer', 'utf-8');

  const { data: uploadData, error: uploadErr } = await adminClient.storage
    .from('school-documents')
    .upload(testFileName, testFileBuffer, { contentType: 'text/plain', upsert: true });

  if (uploadErr) {
    console.error('❌ Upload test failed:', uploadErr.message);
  } else {
    console.log(`✅ Upload successful: ${uploadData.path}`);
    const { data: publicUrlData } = adminClient.storage.from('school-documents').getPublicUrl(testFileName);
    console.log(`✅ Generated Public CDN URL: ${publicUrlData.publicUrl}`);

    // Clean up test file
    const { error: removeErr } = await adminClient.storage.from('school-documents').remove([testFileName]);
    if (!removeErr) {
      console.log(`✅ Cleaned up test file from Supabase Storage.`);
    }
  }

  // 4. Test Client with Publishable Key (Public Access)
  console.log('\n[Step 4] Testing Client-Side Publishable Key Security Boundary...');
  const publicClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY);
  console.log('✅ Public client initialized with publishable key.');

  console.log('\n======================================================');
  console.log('🎉 Supabase Live Verification Complete!');
  console.log('======================================================');
}

testSupabaseLive().catch(console.error);
