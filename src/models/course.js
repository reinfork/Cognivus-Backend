const supabase = require('../config/supabase');
const { user: select } = require('../helper/fields');
const storage = require('../middleware/storage');

exports.create = async (data, file, bucket) => {
  const path = `${data.classid}/${Date.now()}`;
  await storage.upload(path, file, 'courses');
  const url = await storage.getPublicUrl(path, bucket);

  //insert new report file
  const {data: fileData, error: fileError} = await supabase
  .from('tbcourse_files')
  .insert({
    'courseid': data.courseid,
    'path': path,
    'url': url
  })
  .select();
 
  if(fileError) throw fileError;
 
  return fileData;
};

exports.delete = async (file, bucket) => {
  const { error: fileError} = await supabase.storage
    .from(bucket)
    .remove(file.path);
}