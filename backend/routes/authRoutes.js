const express = require('express');
const router = express.Router();
const { loginUser, logoutUser, registerUser } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerUser);

module.exports = router;
