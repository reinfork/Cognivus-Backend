const supabase = require('../config/supabase');
const { report: payload } = require('../helper/payload.js');
const storage = require('../models/reports.js');
const bucket = 'reports';

//get all reports
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbreport_files')
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data

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
      .from('tbreport_files')
      .select()
      .eq('rfid', id)
      .single();
    
    if (error) throw error;
    
    res.status(200).json({
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
