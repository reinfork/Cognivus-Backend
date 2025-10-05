const supabase = require('../config/supabase');
const { lecturer: select } = require('../helper/fields');
const { lecturer: payload } = require('../helper/payload');
const { hashPassword } = require('../utils/auth')

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tblecturer')
      .select(select);

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    let { data, error } = await supabase
      .from('tblecturer')
      .select(select)
      .eq('userid', id)
      .single();  

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- Langkah 1: Buat entri di tabel 'tbuser' ---
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required for the user account.' });
    }

    const encrypted_password = await hashPassword(password)

    const { data: newUser, error: userError } = await supabase
      .from('tbuser')
      .insert({
        username,
        email,
        'password': encrypted_password,
        roleid: 2
      })
      .select('userid')
      .single();

    if (userError) {
      return res.status(409).json({ success: false, message: 'Error creating user account.', error: userError.message });
    }

    const insert = { ...payload(req.body), userid: newUser.userid };

    const { data: newLecturer, error: lecturerError } = await supabase
      .from('tblecturer')
      .insert(insert)
      .select()
      .single();

    if (lecturerError) {
      return res.status(500).json({ success: false, message: 'User account created, but failed to create lecturer profile.', error: lecturerError.message });
    }

    res.status(201).json({
      success: true,
      data: newLecturer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lecturer',
      error: error.message
    });
  }
};


//lecturer data update
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);

    const { data, error } = await supabase
      .from('tblecturer')
      .update(insert)
      .eq('userid', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lecturer',
      error: error.message
    });
  }
};

// Delete lecturer
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tblecturer')
      .delete()
      .eq('userid', id);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found.'
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      message: 'Lecturer and associated user account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lecturer',
      error: error.message
    });
  }
}; 