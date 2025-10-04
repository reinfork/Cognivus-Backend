const supabase = require('../config/supabase');
const { student: select } = require('../helper/fields');
const { student: payload } = require('../helper/payload');

//get all student data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbstudent')
      .select(select)
      .order('fullname', { ascending: true });
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

//get student by id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    let { data, error } = await supabase
      .from('tbstudent')
      .select(select)
      .eq('userid', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

//create new student
exports.create = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- Langkah 1: Buat entri di tabel 'users' ---
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required for the user account.' });
    }

    const encrypted_password = hashPassword(password)

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        encrypted_password,
        role_id: 1
      })
      .select('userid')
      .single();

    if (userError) {
      return res.status(409).json({ success: false, message: 'Error creating user account.', error: userError.message });
    }

    const insert = { ...payload(req.body), userid: newUser.userid };

    const { data: newStudent, error: studentError } = await supabase
      .from('tbstudent')
      .insert(insert)
      .select()
      .single();

    if (studentError) {
      return res.status(500).json({ success: false, message: 'User account created, but failed to create student profile.', error: studentError.message });
    }

    res.status(201).json({
      success: true,
      data: newStudent
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lecturer',
      error: error.message
    });
  }
};

//update student data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);

    const { data, error } = await supabase
      .from('tbstudent')
      .update(insert)
      .eq('userid', id)
      .select(select)
      .single();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or could not be updated'
      });
    }
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

//delete student data
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tbstudent')
      .delete()
      .eq('userid', id);
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};