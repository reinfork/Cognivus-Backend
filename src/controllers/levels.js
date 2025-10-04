const supabase = require('../config/supabase');
const { level: payload } = require('../helper/payload');
const { level: select } = require('../helper/fields');

//read all level data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tblevel')
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

//get level by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tblevel')
      .select(select)
      .eq('levelid', id)
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
    const insert = payload(req.body)
    
    const { data, error } = await supabase
      .from('tblevel')
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

// update level data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tblevel')
      .update(insert)
      .eq('levelid', id)
      .select();
    
    if (error) throw error;
    
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

// delete level instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tblevel')
      .delete()
      .eq('levelid', id);
    
    if (error) throw error;
    
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