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

        // Create payload for the access token
        const payload = { userId: user.id };

        // Generate short-lived access token (e.g., expires in 15 minutes)
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

        // Generate refresh token (longer expiration, e.g., 7 days)
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        // Store refresh token securely (e.g., in database or an HTTP-only cookie)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

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

        // Create payload for the access token
        const payload = { userId: user.id };

        // Generate short-lived access token (e.g., expires in 15 minutes)
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

        // Generate refresh token (longer expiration, e.g., 7 days)
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        // Store refresh token securely (e.g., in database or an HTTP-only cookie)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Log out the user
exports.logoutUser = (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: "User logged out successfully" });
};

// Refresh access token
exports.refreshAccessToken = async (req, res) => {
    // Extract the refresh token from the cookie & check whether it's provided or not
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }

    try {
        // Verify the refresh token using the secret key
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // Create a payload for the new access token using the user ID from the decoded token
        const payload = { userId: decoded.userId };

        // Generate a new access token with short expiration time
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};