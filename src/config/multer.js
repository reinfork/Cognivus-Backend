const multer = require('multer');

// Using memory storage for Supabase uploads
const multerConfig = multer({ storage: multer.memoryStorage() });

module.exports = multerConfig;
