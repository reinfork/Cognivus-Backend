const supabase = require('../config/supabase');
const { class: select } = require('../helper/fields.js');
const { class: payload } = require('../helper/fields.js');

// retrieve all data from class
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbclass')
      .select(classes_fields);

    if (error) throw error;

    return res.json({
      success: true,
      data: data

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

//retrieve class data by id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    let lecturerQuery = supabase
      .from('tbclass')
      .select(classes_fields)
      .eq('classid', id)
      .single();

    let { data, error } = await lecturerQuery;

    if (error) throw error;

    return res.json({
      success: true,
      method: "GET",
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

//create new class
exports.create = async (req, res) => {
  try {
    // retrieve data
    const { class_code, description, level_id, teacherid } = req.body;

    if (!class_code || !level_id) {
      return res.status(400).json({ success: false, message: 'Class Code and Level are required for a new class' });
    }

    // Insert into table
    const { data, error } = await supabase
      .from('tbclass')
      .insert({
        class_code, description, level_id, teacherid
      })
      .select('classid')
      .single();

    if (error) {
      return res.status(409).json({ success: false, message: 'Error creating new class.', error: error.message });
    }

    return res.status(201).json({
      success: true,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};


// update class data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_code, description, level_id, teacherid } = req.body;

    // update class
    let updateQuery = supabase
      .from('tbclass')
      .update({
        class_code, description, level_id, teacherid
      })
      .eq('classid', id)
      .select(classes_fields);

    let { data, error } = await updateQuery;

    if (error) throw error;

    return res.json({
      success: true,
      data: data[0]

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

//delete a class
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tbclass')
      .delete()
      .eq('classid', id)
      .select(classes_fields);

    if (error) throw error;

    return res.json({
      success: true,
      message: `class id: ${id} deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
}; 