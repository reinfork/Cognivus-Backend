const supabase = require('../config/supabase');

// Default bucket when none provided (matches tests expecting 'courses')
const DEFAULT_BUCKET = 'courses';

exports.upload = async (path, file, bucket = DEFAULT_BUCKET) => {
  // accept either a file object with buffer/mimetype or raw buffer
  const payload = file && 'buffer' in file ? file.buffer : file;
  const options = file && typeof file.mimetype !== 'undefined' ? { contentType: file.mimetype, upsert: true } : { upsert: true };

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, payload, options);

  if (error) throw error;
  return { path, bucket };
};

exports.delete = async (pathOrPaths, bucket = DEFAULT_BUCKET) => {
  const isArray = Array.isArray(pathOrPaths);
  const arg = isArray ? pathOrPaths : [pathOrPaths]; // Supabase expects array
  const { error } = await supabase.storage.from(bucket).remove(arg);
  if (error) throw error;
  return true;
};

exports.getSignedUrl = async (path, expiresIn = 6000, bucket = DEFAULT_BUCKET) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};

exports.getPublicUrl = async (path, bucket = DEFAULT_BUCKET) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  if (error) throw error;
  return data.publicUrl;
};
