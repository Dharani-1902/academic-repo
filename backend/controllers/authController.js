const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/login
const loginUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ where: { username, role } });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        token: generateToken(user.id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// @desc    Register new user
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ username, password, role });
    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        token: generateToken(user.id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, logoutUser, registerUser };
