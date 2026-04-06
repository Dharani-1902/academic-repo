const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const AcademicRecord = require('./models/AcademicRecord');
const { connectDB } = require('./config/db');
require('dotenv').config();

const studentsData = [
  { student_id: '101', name: 'Dharani', department: 'CSE', year: '3rd Year', email: 'dharani@example.com' },
  { student_id: '102', name: 'Dhivi', department: 'ECE', year: '2nd Year', email: 'dhivi@example.com' },
  { student_id: '103', name: 'Barathi', department: 'IT', year: '4th Year', email: 'barathi@example.com' },
  { student_id: '104', name: 'Ajay', department: 'MECH', year: '1st Year', email: 'ajay@example.com' },
  { student_id: '105', name: 'Gowtham', department: 'CIVIL', year: '3rd Year', email: 'gowtham@example.com' },
  { student_id: '106', name: 'Anbu', department: 'EEE', year: '2nd Year', email: 'anbu@example.com' },
];

const subjectsPerSemester = {
  'Semester 1': [
    { name: 'Engineering Mathematics I', credits: 4 },
    { name: 'Engineering Physics', credits: 3 },
    { name: 'Engineering Chemistry', credits: 3 },
    { name: 'Python Programming', credits: 4 },
    { name: 'Engineering Graphics', credits: 3 }
  ],
  'Semester 2': [
    { name: 'Engineering Mathematics II', credits: 4 },
    { name: 'Materials Science', credits: 3 },
    { name: 'Environmental Science', credits: 3 },
    { name: 'C Programming', credits: 4 },
    { name: 'Basic Electrical Engineering', credits: 3 }
  ],
  'Semester 3': [
    { name: 'Data Structures', credits: 4 },
    { name: 'Object Oriented Programming', credits: 3 },
    { name: 'Digital Logic', credits: 3 },
    { name: 'Computer Architecture', credits: 4 },
    { name: 'Software Engineering', credits: 3 }
  ],
  'Semester 4': [
    { name: 'Design and Analysis of Algorithms', credits: 4 },
    { name: 'Operating Systems', credits: 3 },
    { name: 'Database Management Systems', credits: 4 },
    { name: 'Computer Networks', credits: 3 },
    { name: 'Microprocessors', credits: 3 }
  ],
  'Semester 5': [
    { name: 'Theory of Computation', credits: 4 },
    { name: 'Web Technology', credits: 3 },
    { name: 'Artificial Intelligence', credits: 3 },
    { name: 'Compiler Design', credits: 4 },
    { name: 'Cryptography', credits: 3 }
  ],
  'Semester 6': [
    { name: 'Machine Learning', credits: 4 },
    { name: 'Cloud Computing', credits: 3 },
    { name: 'Data Mining', credits: 3 },
    { name: 'Mobile Application Development', credits: 3 },
    { name: 'Software Testing', credits: 3 }
  ]
};

const getRandomGrade = () => {
  const grades = ['O', 'A+', 'A', 'B+', 'B', 'C'];
  return grades[Math.floor(Math.random() * grades.length)];
};

const seedDB = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({ role: 'student' });
    await Student.deleteMany({});
    await AcademicRecord.deleteMany({});

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({ username: 'admin', password: 'password123', role: 'admin' });
      console.log('Admin user seeded (admin/password123)');
    }

    for (const data of studentsData) {
      const user = await User.create({ username: data.student_id, password: 'student123', role: 'student' });

      await Student.create({
        ...data,
        userId: user._id,
        skills: 'JavaScript, React, Node.js, Python, MongoDB',
        extra_activities: 'Hackathon participant, Tech Club Member, Open Source Contributor',
        skills_status: 'Completed',
        activities_status: 'Ongoing'
      });

      for (const [semester, subjects] of Object.entries(subjectsPerSemester)) {
        for (const subject of subjects) {
          // Give Barathi an arrear in Semester 3 Object Oriented Programming
          let grade = getRandomGrade();
          if (data.student_id === '103' && subject.name === 'Object Oriented Programming') {
            grade = 'U';
          }
          await AcademicRecord.create({
            student_id: data.student_id,
            semester: semester,
            subject_name: subject.name,
            grade: grade,
            credits: subject.credits
          });
        }
      }
      console.log(`Seeded full 6-semester academic report for: ${data.name} (${data.student_id})`);
    }

    console.log('Database Seeding Completed Successfully! All reports generated in MongoDB.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
