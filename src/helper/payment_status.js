const axios = require('axios');
require('dotenv').config();

const base_link = process.env.MIDTRANS_ENV === 'production' ? 
'https://api.midtrans.com/v2' : 
'https://api.sandbox.midtrans.com/v2';

exports.getStatus = async (orderId) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const url = `${base_link}/${encodeURIComponent(orderId)}/status`;
  const auth = Buffer.from(`${serverKey}:`).toString('base64'); // serverKey:
  const resp = await axios.get(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  console.log(url);

  if (!resp || !resp.data) {
    throw new Error('No data from Midtrans');
  }

  return resp.data;
}