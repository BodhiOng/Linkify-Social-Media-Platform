const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if the user already exists by email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Generate a salt for password hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with the provided infos + password in its hashed form
        user = new User({
            username,
            email,
            password: hashedPassword,
        });
        await user.save();

        // Create payload and generate permanent access token
        const payload = { userId: user.id };
        const accessToken = jwt.sign(payload, JWT_SECRET);

        res.status(201).json({ message: 'Register successful', accessToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    // Validate the incoming request based on validation rules set in the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find the user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the inputted password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create payload and generate permanent access token
        const payload = { userId: user.id };
        const accessToken = jwt.sign(payload, JWT_SECRET);

        res.status(200).json({ 
            message: 'Login successful', 
            accessToken,
            user: {
                userId: user._id,
                email: user.email,
                username: user.username
            }
        });
    } catch (err) {
        console.error('Login error: ', err);
        res.status(500).json({ error: err.message });
    }
};

// Log out the user
exports.logoutUser = (req, res) => {
    res.json({ message: "User logged out successfully" });
};