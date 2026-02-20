require('dotenv').config();
const url = process.env.VITE_SUPABASE_URL + '/rest/v1/site_metadata_admin?select=menu_label,page_slug,show_in_menu';
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key } })
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.filter(d => d.page_slug.includes('invent') || d.menu_label.toLowerCase().includes('invent')), null, 2)))
  .catch(err => console.error(err));
