const pino =require('pino');
require('dotenv').config();

exports.logger = pino({
  level: "info",
  formatters: {
    level(label) {
      return { level:label };
    }
  },
  base: {
    service: "ITTR-LMS API",
    env: process.env.NODE_ENV
  }
});