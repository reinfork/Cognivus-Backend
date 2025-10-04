const supabase = require('../config/supabase');
const { courses_fields } = require('../helper/fields.js');

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbmaterials')
      .select(courses_fields);

    if (error) throw error;

    return res.json({
      success: true,
      data: data

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    let lecturerQuery = supabase
      .from('tbmaterials')
      .select(courses_fields)
      .eq('materialid', id)
      .single();

    let { data, error } = await lecturerQuery;

    if (error) throw error;

    return res.json({
      success: true,
      method: "get",
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    // retrieve data
    const { title } = req.body; 
    const { material_code, file, video_link, level_id } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title are required for a new course' });
    }

    // Insert into table
    const { data, error } = await supabase
      .from('tbmaterials')
      .insert({
        title, material_code, file, video_link, level_id
      })
      .select('materialid')
      .single();

    if (error) {
      return res.status(409).json({ success: false, message: 'Error creating new course.', error: error.message });
    }

    return res.status(201).json({
      success: true,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};


// Update data lecturer
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, material_code, file, video_link, level_id } = req.body;

    // update course
    let updateQuery = supabase
      .from('tbmaterials')
      .update({
        title, material_code, file, video_link, level_id
      })
      .eq('materialid', id)
      .select(courses_fields);

    let { data, error } = await updateQuery;

    if (error) throw error;

    return res.json({
      success: true,
      data: data[0]

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tbmaterials')
      .delete()
      .eq('materialid', id)
      .select(courses_fields);

    if (error) throw error;

    return res.json({
      success: true,
      message: `Course id: ${id} deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
}; 