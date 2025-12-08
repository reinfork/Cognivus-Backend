const supabase = require('../config/supabase');
const { course_files: payload } = require('../helper/payload.js');
const reports = require('../models/reports');
const bucket = 'courses';

//get all reports
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbcourse_files')
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      data: data

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

//get reports by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbcourse_files')
      .select()
      .eq('cfid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// delete course file
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tbcourse_files')
      .delete()
      .eq('cfid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course file not found.'
      });
    }

    await reports.delete(data, bucket);

    res.status(200).json({
      success: true,
      message: 'course file deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course file',
      error: error.message
    });
  }
};