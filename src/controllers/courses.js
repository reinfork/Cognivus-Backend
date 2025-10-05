const supabase = require('../config/supabase');
const { course: select } = require('../helper/fields.js');
const { course: payload } = require('../helper/payload.js');

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbcourse')
      .select(select);

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
      .from('tbcourse')
      .select(select)
      .eq('courseid', id)
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
    const { course_code, file, video_link, classid } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title are required for a new course' });
    }

    // Insert into table
    const { data, error } = await supabase
      .from('tbcourse')
      .insert({
        title, course_code, file, video_link, classid
      })
      .select('courseid')
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
    const { title, course_code, file, video_link, classid } = req.body;

    // update course
    let updateQuery = supabase
      .from('tbcourse')
      .update({
        title, course_code, file, video_link, classid
      })
      .eq('courseid', id)
      .select(select);

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
      .from('tbcourse')
      .delete()
      .eq('courseid', id)
      .select(select);

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