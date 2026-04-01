const express = require('express');
const router = express.Router();
const { getRecords, addRecord, updateRecord, deleteRecord, getAllArrears } = require('../controllers/recordController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, addRecord);

router.route('/arrears')
  .get(protect, admin, getAllArrears);

router.route('/:student_id')
  .get(protect, getRecords); // Admin and specific student can access, handled in controller or via frontend route

router.route('/:id')
  .put(protect, admin, updateRecord)
  .delete(protect, admin, deleteRecord);

module.exports = router;
