const {sendWhatsappMessage} = require('../config/omnichat');

exports.grade = async (id) => {
  try{
    const { data, error } = await supabase
      .from('tbstudent')
      .select('fullname', 'phone')
      .eq('studentid', id)
      .single();

    const message = `Hi *${data.fullname}*, your recent grade report has been uploaded. Please check your LMS dashboard.`;

    // send WhatsApp message
    await sendWhatsappMessage({
      phone: data.phone,
      text: message,
    });

  }catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error sends message to WhatsApp',
      error: error.message
    });
  }
}

exports.course = async (id) => {
  try{
    const { data, error } = await supabase
      .from('tbstudent')
      .select(select)
      .eq('studentid', id)
      .single();

    const message = `Hi *${data.fullname}*, your recent class has a new material uploaded. Go check it out on your LMS dashboard.`;

    // send WhatsApp message
    await sendWhatsappMessage({
      phone: data.phone,
      text: message,
    });

  }catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error sends message to WhatsApp',
      error: error.message
    });
  }
}