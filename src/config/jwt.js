require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-development-secret-key';

module.exports = {JWT_SECRET};