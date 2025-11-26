const supabase = require('../config/supabase');
const { user: payload } = require('../helper/payload');
const { user: select } = require('../helper/fields');
const { hashPassword } = require('../utils/auth.js');

//read all user data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbuser')
      .select(select);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

//read user by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbuser')
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
      message: 'Error fetching user',
      error: error.message
    });
  }
};

//insert new user
exports.create = async (req, res) => {
  try {
    let insert = payload(req.body);
    
    // Hash password if provided
    if (insert.password) {
      insert.password = await hashPassword(insert.password);
    }
    
    const { data, error } = await supabase
      .from('tbuser')
      .insert(insert)
      .select();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// update user data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    let insert = payload(req.body);
    
    // Hash password if it's being updated
    if (insert.password) {
      insert.password = await hashPassword(insert.password);
    }
    
    const { data, error } = await supabase
      .from('tbuser')
      .update(insert)
      .eq('userid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// delete user instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tbuser')
      .delete()
      .eq('userid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'user deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lecturer',
      error: error.message
    });
  }
};