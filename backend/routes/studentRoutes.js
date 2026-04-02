const express = require('express');
const router = express.Router();
const { getStudents, createStudent, updateStudent, deleteStudent, getStudentProfile } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.get('/profile/:id', protect, getStudentProfile);

router.route('/:id')
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
