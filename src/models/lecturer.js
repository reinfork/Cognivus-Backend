// This is a representation of your Supabase table
// In Supabase, you don't need Sequelize models, but this helps with documentation

class tbTeacher {
  constructor(data) {
    this.user_id = data.id;
    this.fullname = data.fullname;
    this.birthplace = data.birthplace;
    this.birthdate = data.birthdate;
    this.address = data.address;
    this.phone = data.phone;
    this.lasteducation = data.lasteducation;
    this.gender = data.gender;
    this.email = data.email;
    this.photo = data.photo;
  }
}

module.exports = Student;