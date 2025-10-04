const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SUPER_KEY

if(!supabaseUrl || !supabaseKey){
	throw new Error('Supabase URL and API Key are required');
}
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
