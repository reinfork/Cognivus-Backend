const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const supabase = require('./config/supabase');
const passport = require('./config/passport');
const { requestID } = require('./middleware/request_id');
const pinoHttp = require('pino-http');
const { logger } = require('./utils/logger');
const { generalLimiter, authLimiter, lecturerLimiter, adminLimiter } = require('./middleware/rate_limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

//logger
app.use(requestID);
app.use(
  pinoHttp({
    logger,
    customGenReqId: function (req) {
      return req.id;          // use our middleware ID
    },
    customSuccessMessage: function (req, res) {
      return `${req.method} ${req.url} completed`;
    },
    customErrorMessage: function (req, res, error) {
      return `${req.method} ${req.url} errored`;
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url
      }),
      res: (res) => ({
        statusCode: res.statusCode
      })
    }
  })
);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Import routes
const authRoutes = require('./routes/auth.js');
const studentRoutes = require('./routes/students');
const lecturerRoutes = require('./routes/lecturers');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const classRoutes = require('./routes/classes');
const levelsRoutes = require('./routes/levels');
const teacher_levelRoutes = require('./routes/teacher_level');
const programRoutes = require('./routes/programs');
const priceRoutes = require('./routes/prices');
const gradeRoutes = require('./routes/grades');
const reportFileRoutes = require('./routes/report_files');
const courseFileRoutes = require('./routes/course_files');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payment');
const emailRoutes = require('./routes/email');
const ancillaryPriceRoutes = require('./routes/ancillary_price');

// Use routes
app.use('/api/auth', authRoutes, authLimiter);
app.use('/api/students', studentRoutes, generalLimiter);
app.use('/api/lecturers', lecturerRoutes, lecturerLimiter);
app.use('/api/users', userRoutes, adminLimiter);
app.use('/api/courses', courseRoutes, generalLimiter);
app.use('/api/classes', classRoutes, adminLimiter);
app.use('/api/levels', levelsRoutes, adminLimiter);
app.use('/api/teacher_levels', teacher_levelRoutes, adminLimiter);
app.use('/api/programs', programRoutes, adminLimiter);
app.use('/api/prices', priceRoutes, adminLimiter);
app.use('/api/grades', gradeRoutes, adminLimiter);
app.use('/api/report_files', reportFileRoutes, adminLimiter);
app.use('/api/course_files', courseFileRoutes, adminLimiter);
app.use('/api/dashboard', dashboardRoutes, adminLimiter);
app.use('/api/payment', paymentRoutes, adminLimiter);
app.use('/api/email', emailRoutes, adminLimiter);
app.use('/api/ancillary_price', ancillaryPriceRoutes, adminLimiter);

// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tbprogram').select('*').limit(1);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Supabase Connection Failed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ITTR Cognivus Backend is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;