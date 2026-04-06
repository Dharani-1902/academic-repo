const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const AcademicRecord = require('./models/AcademicRecord');
const { connectDB } = require('./config/db');
const oldData = require('./mysql_output.json');
require('dotenv').config();

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
  ]
};

const getRandomGrade = () => {
  const grades = ['O', 'A+', 'A', 'B+', 'B', 'C'];
  return grades[Math.floor(Math.random() * grades.length)];
};

const migrateDB = async () => {
  try {
    await connectDB();
    
    // Clear out current MongoDB data
    await User.deleteMany({});
    await Student.deleteMany({});
    await AcademicRecord.deleteMany({});

    console.log('Cleared existing MongoDB databases');

    for (const u of oldData.users) {
      // Use collection.insertOne to bypass the 'save' middleware so it doesn't double-hash the passwords
      await mongoose.connection.db.collection('users').insertOne({
        username: u.username,
        password: u.password,
        role: u.username === 'admin' ? 'admin' : 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Migrated Users (with exact old passwords)');

    // Fetch the newly created Users back so we have their ObjectIds
    const allUsers = await User.find({});
    
    // Migrate Students
    for (const s of oldData.students) {
      const userDoc = allUsers.find(user => user.username === s.student_id);
      
      await Student.create({
        student_id: s.student_id,
        name: s.name,
        department: s.department,
        year: s.year,
        email: `${s.name.toLowerCase()}@example.com`,
        userId: userDoc ? userDoc._id : null,
        skills: 'JavaScript, Web Development, Teamwork',
        extra_activities: 'Hackathon participant, Cultural Event Organizer',
        skills_status: 'Completed',
        activities_status: 'Ongoing'
      });

      // Give them some generic Academic Records 
      for (const [semester, subjects] of Object.entries(subjectsPerSemester)) {
        for (const subject of subjects) {
          let grade = getRandomGrade();
          if (s.student_id === '103' && subject.name === 'Python Programming') {
            grade = 'U'; // Enforce arrear for BARATH
          }
          await AcademicRecord.create({
            student_id: s.student_id,
            semester: semester,
            subject_name: subject.name,
            grade: grade,
            credits: subject.credits
          });
        }
      }
    }
    
    console.log('Migrated Students and generated academic reports.');
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Migration Error:', error.message);
    process.exit(1);
  }
};

migrateDB();
