// This is a representation of your Supabase table
// In Supabase, you don't need Sequelize models, but this helps with documentation

class tbStudent {
  constructor(data) {
    this.user_id = data.id;
    this.student_id = data.student_id;
    this.fullname = data.fullname;
    this.gender = data.gender;
    this.address = data.address;
    this.phone = data.phone;
    this.parentname = data.parentname;
    this.parentphone = data.parentphone;
    this.birthplace = data.birthplace;
    this.birthdate = data.birthdate;
    this.photo = data.photo;
    this.created_at = data.created_at;
    this.birthdate = data.birthdate;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Student;