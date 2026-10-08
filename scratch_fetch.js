const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('teams').select('*').limit(1);
  console.log('Teams:', data);
  if (data && data.length > 0) {
    const { data: members } = await supabase.from('team_members').select('*').eq('team_id', data[0].id);
    console.log('Members:', members);
  }
}
run();
