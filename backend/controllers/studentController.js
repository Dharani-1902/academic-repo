const Student = require('../models/Student');
const User = require('../models/User');

const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'username');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  const { student_id, name, department, year, email, password, skills, extra_activities } = req.body;
  try {
    const userExists = await User.findOne({ username: student_id });
    if (userExists) {
      return res.status(400).json({ message: 'User for this student already exists' });
    }
    
    // Create student user account
    const user = await User.create({
      username: student_id,
      password,
      role: 'student'
    });

    // Create student profile record
    const student = await Student.create({
      student_id,
      name,
      department,
      year,
      email,
      skills,
      extra_activities,
      userId: user._id
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      student.name = req.body.name || student.name;
      student.department = req.body.department || student.department;
      student.year = req.body.year || student.year;
      student.email = req.body.email || student.email;
      student.skills = req.body.skills !== undefined ? req.body.skills : student.skills;
      student.extra_activities = req.body.extra_activities !== undefined ? req.body.extra_activities : student.extra_activities;
      student.skills_status = req.body.skills_status !== undefined ? req.body.skills_status : student.skills_status;
      student.activities_status = req.body.activities_status !== undefined ? req.body.activities_status : student.activities_status;
      
      await student.save();
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      // Delete associated user
      await User.findByIdAndDelete(student.userId);
      // Delete student record
      await Student.findByIdAndDelete(req.params.id);
      res.json({ message: 'Student and associated user removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ student_id: req.params.id }).populate('userId', 'username');
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent, getStudentProfile };
