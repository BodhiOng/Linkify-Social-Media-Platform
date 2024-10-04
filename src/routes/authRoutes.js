const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register',
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    authController.registerUser
);

// User login
router.post('/api/login',
    // body('email').isEmail().withMessage('Please provide a valid email'),
    // body('password').exists().withMessage('Password is required'),
    authController.loginUser
);

// User log out
router.post('/logout', verifyToken, authController.logoutUser);

// Refresh token
router.post("/refresh-token", authController.refreshAccessToken);

module.exports = router;