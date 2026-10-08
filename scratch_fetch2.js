const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('team_members').select('*').limit(5);
  console.log('Error:', error);
  console.log('Members:', data);
}
run();
