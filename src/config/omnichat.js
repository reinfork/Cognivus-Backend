require('dotenv').config();

const endpoint = process.env.OMNICHAT_ENDPOINT;
const deviceKey = process.env.OMNICHAT_DEVICE_KEY;
const apiKey = process.env.OMNICHAT_API_KEY;

module.exports = { endpoint, deviceKey, apiKey };
