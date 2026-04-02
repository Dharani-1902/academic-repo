const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  subject_name: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
module.exports = AcademicRecord;
