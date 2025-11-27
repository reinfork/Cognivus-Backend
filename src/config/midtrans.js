const midtransClient = require('midtrans-client');
require('dotenv').config();

const status = (process.env.MIDTRANS_ENV === 'production') ? true : false;

const snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY
});

module.exports = snap;