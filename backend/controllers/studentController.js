const Student = require('../models/Student');
const User = require('../models/User');

const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: User, attributes: ['username'] }]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  const { student_id, name, department, year, email, password } = req.body;
  try {
    const userExists = await User.findOne({ where: { username: student_id } });
    if (userExists) {
      return res.status(400).json({ message: 'User for this student already exists' });
    }
    
    const user = await User.create({
      username: student_id,
      password,
      role: 'student'
    });

    const student = await Student.create({
      student_id,
      name,
      department,
      year,
      email,
      userId: user.id
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (student) {
      student.name = req.body.name || student.name;
      student.department = req.body.department || student.department;
      student.year = req.body.year || student.year;
      student.email = req.body.email || student.email;
      
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
    const student = await Student.findByPk(req.params.id);
    if (student) {
      await User.destroy({ where: { id: student.userId } });
      await student.destroy();
      res.json({ message: 'Student and associated user removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };
