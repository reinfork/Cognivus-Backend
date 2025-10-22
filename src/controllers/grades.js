const supabase = require('../config/supabase');
const { grade: select } = require('../helper/fields');
const { grade: payload } = require('../helper/payload');
const reports = require('../models/reports');
const bucket = "reports";

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbgrade')
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
      .from('tbgrade')
      .select(select)
      .eq('studentid', id);

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

//insert new student grade
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);
    const file = req.file;

    if (!insert.test_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test type are required for a new grade' 
      });
    }

    //insert new grade into table
    const { data, error } = await supabase
      .from('tbgrade')
      .insert(insert)
      .select();

    if(error) throw error;
    let uploaded = []

    //upload files
    if(file) {
      results = await reports.create(data[0], file, bucket);
      uploaded.push(results);
    };

    return res.status(201).json({
      success: true,
      data,
      uploaded
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
    const file = req.file;

    // update grade
    const { data, error } = await supabase
      .from('tbgrade')
      .update(insert)
      .eq('gradeid', id)
      .select();

    if (error) throw error;
    let uploaded = [];

    //find or upload
    if (file && file.length > 0) {
      const results = await reports.createOrReplace(data[0], file, bucket);
      uploaded.push(results);
    };

    return res.status(201).json({
      success: true,
      data,
      uploaded
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

//remove student grade record
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tbgrade')
      .delete()
      .eq('gradeid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'student/grade not found.'
      });
    }

    const file = data[0].tbreport_files;

    //remove files from bucket
    if(file) await reports.delete(file[0], bucket);

    return res.status(200).json({
      success: true,
      message: `students grade id: ${id} hard deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting students grade',
      error: error.message
    });
  }
}; 