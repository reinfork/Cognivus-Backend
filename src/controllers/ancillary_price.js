const supabase = require('../config/supabase');
const { ancillary: payload } = require('../helper/payload');
const { ancillary: select } = require('../helper/fields');

//read all ancillary_price data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbancillary_price')
      .select(select);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ancillary_price',
      error: error.message
    });
  }
};

//get ancillary_price by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbancillary_price')
      .select(select)
      .eq('apid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ancillary_price',
      error: error.message
    });
  }
};

//insert new ancillary_price
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body)
    
    const { data, error } = await supabase
      .from('tbancillary_price')
      .insert(insert)
      .select();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ancillary_price',
      error: error.message
    });
  }
};

// update ancillary_price data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tbancillary_price')
      .update(insert)
      .eq('apid', id)
      .select();
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ancillary_price not found.'
      });
    }
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ancillary_price',
      error: error.message
    });
  }
};

// delete ancillary_price instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tbancillary_price')
      .delete()
      .eq('apid', id)
      .select();
    
    if (error) throw error;

    console.log(data);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ancillary_price not found.'
      });
    }
    
    res.json({
      success: true,
      message: 'ancillary_price deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ancillary_price',
      error: error.message
    });
  }
};