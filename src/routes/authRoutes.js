const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register',
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    registerUser
);

// User login
router.post('/login',
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
    loginUser
);

// User log out
router.post('/logout', verifyToken, logoutUser);

// Refresh token
router.post("/refresg-token", refreshAccessToken);

module.exports = router;