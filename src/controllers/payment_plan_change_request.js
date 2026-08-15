const supabase = require('../config/supabase');
const { payment_request: select } = require('../helper/fields');

//read all data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbpayment_plan_change_request')
      .select(select)
      .order('requestid');

    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message
    });
  }
};

//get data by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbpayment_plan_change_request')
      .select(select)
      .eq('requestid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message
    });
  }
};

//insert new data
exports.create = async (req, res) => {
  try {
    const insert = req.body;

    console.log(insert);
    
    const { data, error } = await supabase
      .from('tbpayment_plan_change_request')
      .insert(insert)
      .select();
    
    if (error) {
      console.error('SUPABASE ERROR:', error);
      throw error;
    }
    
    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message
    });
  }
};

// update request data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = req.body;
    
    const { data, error } = await supabase
      .from('tbpayment_plan_change_request')
      .update(insert)
      .eq('requestid', id)
      .select()
      .maybeSingle()
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'request not found.'
      });
    }
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating request',
      error: error.message
    });
  }
};

// delete request instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tbpayment_plan_change_request')
      .delete()
      .eq('requestid', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting request',
      error: error.message
    });
  }
};