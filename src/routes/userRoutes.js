const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get a single user by their username
router.get('/:username', userController.getUserByUsername);

// Update the logged-in user's info
router.put('/:id', verifyToken, userController.updateUser);

// Deactivate a user account
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;