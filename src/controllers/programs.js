const supabase = require('../config/supabase');
const { program: payload } = require('../helper/payload');
const { program: select } = require('../helper/fields');

//read all program data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbprogram')
      .select(select);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching program',
      error: error.message
    });
  }
};

//read program by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbprogram')
      .select(select)
      .eq('programid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching program',
      error: error.message
    });
  }
};

//insert new program
exports.create = async (req, res) => {
  try {

    const insert = payload(req.body)
    
    const { data, error } = await supabase
      .from('tbprogram')
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
      message: 'Error creating program',
      error: error.message
    });
  }
};

// update program data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tbprogram')
      .update(insert)
      .eq('programid', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating program',
      error: error.message
    });
  }
};

// delete program instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tbprogram')
      .delete()
      .eq('programid', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lecturer',
      error: error.message
    });
  }
};