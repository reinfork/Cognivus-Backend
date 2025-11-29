const supabase = require('../config/supabase');
const { user: select } = require('../helper/fields');

exports.findOrCreate = async (profile) => {
  const { data: existingUser, error: findError } = await supabase
    .from('tbuser')
    .select(select)
    .eq('google_id', profile.id)
    .single();

  if (existingUser) {
    return existingUser;
  }

  const email = profile.emails[0].value;
  const displayName = profile.displayName || email.split('@')[0];
  
  let username = displayName.toLowerCase().replace(/\s+/g, '');
  const { data: existingUsername } = await supabase
    .from('tbuser')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUsername) {
    username = `${username}${Math.floor(Math.random() * 10000)}`;
  }

  const { data: newUser, error: userError } = await supabase
    .from('tbuser')
    .insert({
      username,
      google_id: profile.id,
      email,
      roleid: 1,
      is_active: true,
      raw_meta_data: profile._json
    })
    .select(select)
    .single();

  if (userError) throw userError;

  const { error: studentError } = await supabase
    .from('tbstudent')
    .insert({
      userid: newUser.userid,
      fullname: displayName,
      classid: 4
    });

  if (studentError) throw studentError;

  return newUser;
}