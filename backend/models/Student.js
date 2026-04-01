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
  }
});

// Relationships
Student.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Student, { foreignKey: 'userId' });

module.exports = Student;
