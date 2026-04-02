const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Student = sequelize.define('Student', {
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  extra_activities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills_status: {
    type: DataTypes.STRING,
    defaultValue: 'Ongoing'
  },
  activities_status: {
    type: DataTypes.STRING,
    defaultValue: 'Ongoing'
  }
});

// Relationships
Student.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Student, { foreignKey: 'userId' });

module.exports = Student;
