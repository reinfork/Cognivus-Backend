const supabase = require('../config/supabase');
const { course: select } = require('../helper/fields.js');
const { course: payload } = require('../helper/payload.js');
const courses = require('../models/course.js');
const bucket = 'courses';

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbcourse')
      .select(select);

    if (error) throw error;

    return res.json({
      success: true,
      data

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
      data
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
    const insert = payload(req.body);
    const files = req.files;

    if (!insert.title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title are required for a new course' 
      });
    }

    // Insert into table
    const { data, error } = await supabase
      .from('tbcourse')
      .insert(insert)
      .select();

    if (error) throw error;

    let results = [];

    if(files){
      for(const file of files){
        let courseFile = await courses.create(data[0], file, bucket);
        results.push(courseFile);
      }
    }

    return res.status(201).json({
      success: true,
      data,
      files: results
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
    const files = req.files;
    const insert = payload(req.body);

    // update course
    const { data, error } = await supabase
      .from('tbcourse')
      .update(insert)
      .eq('courseid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    let results = [];

    if(files){
      for(const file of files){ 
        let courseFile = await courses.create(data[0], file, bucket);
        results.push(courseFile);
      }
    }

    return res.status(201).json({
      success: true,
      data,
      files: results

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

    //delete course record
    const { data, error } = await supabase
      .from('tbcourse')
      .delete()
      .eq('courseid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    const files = data[0].tbcourse_files;

    //remove files from bucket
    if(files){
      for(const file of files) await courses.delete(file, bucket);
    }

    return res.json({
      success: true,
      message: `Course id: ${id} hard deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
}; 