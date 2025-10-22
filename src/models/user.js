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

  // Handle query error
  if (error) {
    throw error;
  }

  if (existingUser) {
    return existingUser;
  }

  // Generate username by combining given_name and family_name in lowercase
  const username = `${profile.given_name.toLowerCase()}${profile.family_name.toLowerCase()}`;

  // Create new user
  const insertResponse = await supabase
    .from('tbuser')
    .insert([
      {
        username,
        google_id: profile.id,
        email: profile.emails[0].value,
        roleid: 1
      }
    ])
    .select(select)
    .single();

  // Handle insert error
  if (insertResponse.error) {
    throw insertResponse.error;
  }

  return insertResponse.data;
}