import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const newNotice = {
    id: 'test-notice-01',
    title: 'Test Circular',
    category: 'Important',
    description: 'Test description',
    notice_date: '2026-09-25',
    is_important: true,
    published: true
  };

  const { data, error } = await supabase.from('notices').upsert([newNotice], { onConflict: 'id' }).select();
  console.log('Upsert result:', data, 'Error:', error);

  const { error: delErr } = await supabase.from('notices').delete().eq('id', 'test-notice-01');
  console.log('Delete result:', delErr);

  process.exit(0);
}

main();
