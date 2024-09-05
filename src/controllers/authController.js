const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
exports.registerUser = async (req, res) => {
    // Validate the incoming request based on validation rules set in the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation errors exist, return 404 status with the errors
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

        // Save the new user to the database
        await user.save();

        // Create a payload for JWT that contains the user ID
        const payload = { userId: user.id };
        // Sign the JWT token with the secret and set it to expire in 1 hour
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Return the generated token in the response
        res.status(201).json({ token });
    } catch (err) {
        // Return a 500 status in case of server error
        res.status(500).json({ error: err.message });
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    // Validate the incoming request based on validation rules set in the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation errors exist, return 400 status with the error
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find the user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
            // If user is not found, return error message
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the inputted password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // If the passwords don't match, return error message
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        // Create a payload for JWT that contains the user ID
        const payload = { userId: user.id };
        // Sign the JWT token with the secret and set it to expire in 1 hour
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Token tweaks for security and production purposes
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Respond with success message and generated token
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        // Return 500 status in case of server error
        res.status(500).json({ error: err.message });
    }
};

// Log out the user
exports.logoutUser = (req, res) => {
    // Return indication message of successful log out
    res.json({ message: "User logged out successfully" });
};