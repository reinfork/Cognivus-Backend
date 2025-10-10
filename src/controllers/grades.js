const supabase = require('../config/supabase');
const { grade: select } = require('../helper/fields.js');
const { grade: payload } = require('../helper/payload.js');

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbgrades')
      .select(select);

    if (error) throw error;

    return res.json({
      success: true,
      data: data

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbgrades')
      .select(select)
      .eq('studentid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);

    // Insert into table
    const { data, error } = await supabase
      .from('tbgrades')
      .insert(insert)
      .select();

    if(error) throw error;

    return res.status(201).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating new grade',
      error: error.message
    });
  }
};


// Update data lecturer
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);

    // update grade
    let updateQuery = supabase
      .from('tbgrades')
      .update(insert)
      .eq('studentid', id)
      .select(select);

    let { data, error } = await updateQuery;

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'grade not found.'
      });
    }

    return res.json({
      success: true,
      data: data[0]

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tbgrades')
      .delete()
      .eq('studentid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'student/grade not found.'
      });
    }

    return res.json({
      success: true,
      message: `students grade id: ${id} deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting students grade',
      error: error.message
    });
  }
}; 