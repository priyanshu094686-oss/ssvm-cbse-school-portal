import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.js';

export const VALID_BUCKETS = [
  'school-documents',
  'notices',
  'gallery',
  'staff',
  'achievements',
  'calendar',
  'forms',
  'transfer-certificates'
] as const;

export type StorageBucket = typeof VALID_BUCKETS[number];

// Initialize Supabase Client for Server-Side Storage Operations (using secure Secret Key)
let supabaseAdmin: SupabaseClient | null = null;
if (ENV.SUPABASE_URL && ENV.SUPABASE_SECRET_KEY) {
  supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export const StorageService = {
  getBucketDir(bucket: StorageBucket): string {
    const dir = path.join(ENV.UPLOAD_DIR, bucket);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  },

  async initStorage(): Promise<void> {
    // Ensure local directories exist for backup/fallback
    VALID_BUCKETS.forEach(bucket => {
      this.getBucketDir(bucket);
    });

    if (supabaseAdmin && ENV.STORAGE_DRIVER === 'supabase') {
      try {
        for (const bucket of VALID_BUCKETS) {
          const { error } = await supabaseAdmin.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: ENV.MAX_FILE_SIZE_MB * 1024 * 1024
          });
          if (error && !error.message?.includes('already exists')) {
            console.warn(`[Supabase Storage] Notice on bucket ${bucket}:`, error.message);
          }
        }
        console.log('☁️ Supabase Storage buckets verified:', VALID_BUCKETS.join(', '));
      } catch (err) {
        console.warn('⚠️ Could not verify Supabase Storage buckets:', err);
      }
    } else {
      console.log('📁 Storage buckets initialized:', VALID_BUCKETS.join(', '));
    }
  },

  async uploadFile(bucket: StorageBucket, fileName: string, filePath: string, mimeType?: string): Promise<string> {
    const cleanFileName = path.basename(fileName);

    if (supabaseAdmin && ENV.STORAGE_DRIVER === 'supabase') {
      try {
        const fileContent = fs.readFileSync(filePath);
        const { error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(cleanFileName, fileContent, {
            contentType: mimeType || 'application/octet-stream',
            upsert: true
          });

        if (error) {
          console.warn(`[Supabase Storage] Upload notice: ${error.message}. Returning public Supabase URL.`);
        }

        const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(cleanFileName);
        return data.publicUrl || `${ENV.SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanFileName}`;
      } catch (err) {
        console.error('Supabase upload exception:', err);
        return this.getPublicUrl(bucket, cleanFileName, false);
      }
    }

    return this.getPublicUrl(bucket, cleanFileName);
  },

  async deleteFile(bucket: StorageBucket, fileName: string): Promise<boolean> {
    const cleanFileName = path.basename(fileName);
    let localDeleted = false;

    try {
      const filePath = path.join(this.getBucketDir(bucket), cleanFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        localDeleted = true;
      }
    } catch (err) {
      console.error(`Error deleting local file ${cleanFileName} in bucket ${bucket}:`, err);
    }

    if (supabaseAdmin && ENV.STORAGE_DRIVER === 'supabase') {
      try {
        await supabaseAdmin.storage.from(bucket).remove([cleanFileName]);
        return true;
      } catch (err) {
        console.error(`Error deleting Supabase storage file ${cleanFileName}:`, err);
      }
    }

    return localDeleted;
  },

  getPublicUrl(bucket: StorageBucket, fileName: string, preferSupabase = true): string {
    const cleanFileName = path.basename(fileName);
    if (preferSupabase && ENV.STORAGE_DRIVER === 'supabase' && ENV.SUPABASE_URL) {
      return `${ENV.SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanFileName}`;
    }
    return `/storage/uploads/${bucket}/${cleanFileName}`;
  }
};
