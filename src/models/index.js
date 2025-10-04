const sequelize = require('../config/database');
const User = require('./user');
const Course = require('./course');
const Enrollment = require('./enrollment');

// Define associations
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Database synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Course,
  Enrollment,
  syncDatabase
};