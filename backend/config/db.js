const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'student_academic_repo',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '', 
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected successfully.');
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
