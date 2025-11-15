const supabase = require('../config/supabase');

exports.upload = async (path, file, bucket) => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });
  if (error) throw error;
};

exports.delete = async (path, bucket) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};

exports.getSignedUrl = async (path, expiresIn = 6000) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};

exports.getPublicUrl = async(path, bucket) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  if(error) throw error;
  return data.publicUrl;
}