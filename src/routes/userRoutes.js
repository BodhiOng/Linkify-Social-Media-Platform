const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { getAllUsers, getUserByUsername, updateUser, deleteUser } = require('../controllers/userController');

// Get all users
router.get('/', getAllUsers);

// Get a single user by their username
router.get('/:username', getUserByUsername);

// Update the logged-in user's info
router.put('/:id', verifyToken, updateUser);

// Deactivate a user account
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;