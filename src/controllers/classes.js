const supabase = require('../config/supabase');
const { class: select } = require('../helper/fields.js');
const { class: payload } = require('../helper/payload.js');

// retrieve all data from class
exports.getAll = async (req, res) => {
  try {
    const id = req.query.lecturerid;
    let query = supabase
        .from('tbclass')
        .select();

    if(id){
        query = query.eq('lecturerid', id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data

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
      .select(select)
      .eq('classid', id)
      .single();

    let { data, error } = await lecturerQuery;

    if (error) throw error;

    return res.json({
      success: true,
      data
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
    const insert = payload(req.body);

    if (!insert.class_code || !insert.levelid) {
      return res.status(400).json({ success: false, message: 'Class Code and Level are required for a new class' });
    }

    // Insert into table
    const { data, error } = await supabase
      .from('tbclass')
      .insert(insert)
      .select();

    if (error) {
      return res.status(409).json({ success: false, message: 'Error creating new class.', error: error.message });
    }

    return res.status(201).json({
      success: true,
      data
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
    const insert = payload(req.body);

    // only one class may be the default target for new Google sign-ups
    if (insert.is_default === true) {
      const { error: unsetError } = await supabase
        .from('tbclass')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('classid', id);

      if (unsetError) throw unsetError;
    }

    // update class
    const { data, error } = await supabase
      .from('tbclass')
      .update(insert)
      .eq('classid', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.'
      });
    }

    return res.json({
      success: true,
      data
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

    // deleting the default class would break new Google sign-ups
    const { data: target } = await supabase
      .from('tbclass')
      .select('is_default')
      .eq('classid', id);

    if (target?.[0]?.is_default) {
      return res.status(400).json({
        success: false,
        message: 'This class is the default for new Google sign-ups. Set another class as default before deleting it.'
      });
    }

    const { data, error } = await supabase
      .from('tbclass')
      .delete()
      .eq('classid', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found.'
      });
    }

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