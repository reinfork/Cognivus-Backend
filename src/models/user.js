// Using Supabase for development
const supabase = require('../config/supabase');
const { user: select } = require('../helper/fields');

exports.findOrCreate = async (profile) => {
  // Check if user exists
  const { data: existingUser, error } = await supabase
    .from('tbuser')
    .select(select)
    .eq('google_id', profile.id)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser , error: userError } = await supabase
    .from('users')
    .insert([
      {
        google_id: profile.id,
        email: profile.emails[0].value,
        roleid: 1
      }
    ])
    .single();

  return newUser;
}