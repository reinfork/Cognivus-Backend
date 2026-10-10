const pino =require('pino');
require('dotenv').config();

exports.logger = pino({
  base: {
    service: "ITTR-LMS API",
    env: process.env.NODE_ENV
  }
});