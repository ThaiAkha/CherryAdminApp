import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.VITE_SUPABASE_ANON_KEY as string);

async function run() {
  const { data } = await supabase.from('site_metadata_admin').select('menu_label, page_slug').order('menu_order', { ascending: true });
  console.log(JSON.stringify(data, null, 2));
}
run();
