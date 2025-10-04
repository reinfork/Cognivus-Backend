const supabase = require('../config/supabase');
const { prices: payload } = require('../helper/payload');
const { prices: select } = require('../helper/fields');

//read all user data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbprice')
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
      .from('tbprice')
      .select(select)
      .eq('priceid', id)
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
      .from('tbprice')
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
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tbprice')
      .update(insert)
      .eq('priceid', id)
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

// delete user instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tbprice')
      .delete()
      .eq('priceid', id);
    
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