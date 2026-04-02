const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  skills: {
    type: String,
    default: ''
  },
  extra_activities: {
    type: String,
    default: ''
  },
  skills_status: {
    type: String,
    default: 'Ongoing'
  },
  activities_status: {
    type: String,
    default: 'Ongoing'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
