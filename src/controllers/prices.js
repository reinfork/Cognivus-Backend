const supabase = require('../config/supabase');
const { prices: payload } = require('../helper/payload');
const { prices: select } = require('../helper/fields');

//read all price data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbprice')
      .select(select);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price',
      error: error.message
    });
  }
};

//read price by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbprice')
      .select(select)
      .eq('priceid', id)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price',
      error: error.message
    });
  }
};

//insert new price
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body)
    
    const { data, error } = await supabase
      .from('tbprice')
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
      message: 'Error creating price',
      error: error.message
    });
  }
};

// update price data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    
    const { data, error } = await supabase
      .from('tbprice')
      .update(insert)
      .eq('priceid', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating price',
      error: error.message
    });
  }
};

// delete price instance
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tbprice')
      .delete()
      .eq('priceid', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'price deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lecturer',
      error: error.message
    });
  }
};