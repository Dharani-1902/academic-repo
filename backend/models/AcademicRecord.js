const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AcademicRecord = sequelize.define('AcademicRecord', {
  student_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credits: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = AcademicRecord;
