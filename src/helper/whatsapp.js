const omnichat = require('../config/omnichat');
const axios = require('axios');

exports.send = async ({ phone, otp}) => {
  try {
    const valid = phone.replace(/^0/, "62");

    const response = await axios.post(omnichat.endpoint, {
      phone: valid,
      device_key: omnichat.deviceKey,
      api_key: omnichat.apiKey,
      method: "text",
      text:`Your verification code is *${otp}*. It will expire in 10 minutes.`,
      is_group: false
    });

    if (response.data.status) {
      console.log("✅ WhatsApp message sent:", phone);
    } else {
      console.error("❌ Failed to send:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Omnichat API Error:", error.response?.data || error.message);
    throw error;
  }
};