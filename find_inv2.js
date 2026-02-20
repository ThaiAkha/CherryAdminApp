const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('site_metadata_admin').select('menu_label, page_slug').order('menu_order', { ascending: true });
  console.log(JSON.stringify(data, null, 2));
}
run();
