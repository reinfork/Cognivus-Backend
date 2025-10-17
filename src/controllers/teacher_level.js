const supabase = require('../config/supabase');
const { teacher_level: payload } = require('../helper/payload');
const { teacher_level: select } = require('../helper/fields');

//read all lecturer on level
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbteacher_level')
      .select(select);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer on level',
      error: error.message
    });
  }
};

//read lecturer on level by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbteacher_level')
      .select(select)
      .eq('classid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer on level',
      error: error.message
    });
  }
};

//assign new lecturer on level
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body)
    
    const { data, error } = await supabase
      .from('tbteacher_level')
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
      message: 'Error assigning lecturer on level',
      error: error.message
    });
  }
};

// update lecturer on level
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tbteacher_level')
      .update(insert)
      .eq('classid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found on level.'
      });
    }
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning lecturer on level',
      error: error.message
    });
  }
};

// unassign lecturer on level
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tbteacher_level')
      .delete()
      .eq('tlid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found from level.'
      });
    }
    
    res.json({
      success: true,
      message: 'lecturer unassigned from level successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unassign lecturer from level',
      error: error.message
    });
  }
};