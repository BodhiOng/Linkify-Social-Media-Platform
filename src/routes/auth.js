const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const verifyToken = require('../middlewares/auth'); 

const router = express.Router();

// JWT secret key for authentication
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
router.post('/register',
    // Validation checks
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // Check if the user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            user = new User({
                username,
                email,
                password: hashedPassword,
            });

            await user.save();

            // Create and return JWT token
            const payload = { userId: user.id };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({ token });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// User login
router.post('/login',
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if the user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Compare the password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Create and return JWT token
            const payload = { userId: user.id };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Protected route example
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;