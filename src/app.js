const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const supabase = require('./config/supabase');
const passport = require('./config/passport');
const { generalLimiter, authLimiter, lecturerLimiter, adminLimiter } = require('./middleware/rate_limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Use routes
app.use('/auth', authRoutes, authLimiter);
app.use('/students', studentRoutes, generalLimiter);
app.use('/lecturers', lecturerRoutes, lecturerLimiter);
app.use('/users', userRoutes, adminLimiter);
app.use('/courses', courseRoutes, generalLimiter);
app.use('/classes', classRoutes, adminLimiter);
app.use('/levels', levelsRoutes, adminLimiter);
app.use('/teacher_levels', teacher_levelRoutes, adminLimiter);
app.use('/programs', programRoutes, adminLimiter);
app.use('/prices', priceRoutes, adminLimiter);
app.use('/grades', gradeRoutes, adminLimiter);
app.use('/report_files', reportFileRoutes, adminLimiter);
app.use('/course_files', courseFileRoutes, adminLimiter);


// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tblevel').select('*');
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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