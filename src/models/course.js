// This is a representation of your Supabase table
// In Supabase, you don't need Sequelize models, but this helps with documentation

class tbmaterials {
  constructor(data) {
    this.materialid = data.materialid;
    this.material_code = data.material_code;
    this.title = data.title;
    this.upload_date = data.upload_date;
    this.file = data.file;
    this.video_link = data.video_link;
    this.class_id = data.class_id;
  }
}

module.exports = Student;