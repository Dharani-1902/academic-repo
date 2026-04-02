const mongoose = require('mongoose');
const User = require('./models/User');
const { connectDB } = require('./config/db');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user seeded (admin/password123)');
    } else {
      console.log('Admin user already exists');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
