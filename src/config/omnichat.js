// services/omnichat.js
import axios from "axios";

const OMNICHAT_API = "https://app.omnichat.id/api-app/whatsapp/send-message";

export const sendWhatsappMessage = async ({ phone, text, isGroup = false }) => {
  try {
    const response = await axios.post(OMNICHAT_API, {
      phone,
      device_key: process.env.OMNICHAT_DEVICE_KEY,  // from Omnichat
      api_key: process.env.OMNICHAT_API_KEY,
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
