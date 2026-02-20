const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('site_metadata_admin').select('menu_label, page_slug, menu_order, id, show_in_menu').order('menu_order', { ascending: true });
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
run();
