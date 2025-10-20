const supabase = require('../config/supabase');
const { user: select } = require('../helper/fields');
const storage = require('../middleware/storage');
const bucket = 'reports';

exports.createOrReplace = async (data, file, bucket) => {

  // find old report
  const { data: fileData, error } = await supabase
    .from('tbreport_files')
    .select() 
    .eq('gradeid', data.gradeid)

  if(error) throw error;

  // Delete old file if exists
  if (fileData[0].path) await storage.delete(fileData[0].path, bucket);

  // Upload new
  const newPath = `${data.studentid}/${data.test_type}_${Date.now()}`;
  await storage.upload(newPath, file, bucket);
  const url = await storage.getPublicUrl(newPath, bucket);

  if (!fileData || fileData.length === 0) {
    //insert new report file
    const {data: insertData, error: insertError} = await supabase
    .from('tbreport_files')
    .insert({
      'gradeid': data.gradeid,
      'studentid': data.studentid,
      'path': newPath,
      'url': url
    })
    .select()
    .single();

    if(insertError) throw insertError;
    return insertData;

  } else {
    //update report file
    const { data: updateData, error: updateError } = await supabase
    .from('tbreport_files')
    .update({
      path: newPath,
      url: url
    }).eq('gradeid', data.gradeid)
    .select()
    .single();

    if(updateError) throw updateError;
    return updateData;
  }
};

exports.create = async (data, file, bucket) => {
  const path = `${data.studentid}/${data.test_type}_${Date.now()}`;
  const results = await storage.upload(path, file.buffer, bucket);
  const url = await storage.getPublicUrl(path);

  //update course files
  const { data: fileData, error: filesError } = await supabase
    .from('tbreport_files')
    .insert({
          'studentid': data.studentid,
          'gradeid': data.gradeid,
          'path': path,
          'url': url
          })
    .select()
    .single();

  if (filesError) throw filesError;
  return fileData;
}

exports.delete = async (file, bucket) => {
  console.log(file.path);
  const { error } = await supabase.storage
    .from(bucket)
    .remove(file.path);
  if (error) return error;
}