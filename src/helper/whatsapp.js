const omnichat = require('../config/omnichat');

exports.send = async ({ phone, text, isGroup = false }) => {
  try {
    const response = await axios.post(omnichat.endpoint, {
      phone,
      device_key: omnichat.deviceKey,  // from Omnichat
      api_key: omnichat.apiKey,
      method: "text",
      text,
      is_group: false,
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