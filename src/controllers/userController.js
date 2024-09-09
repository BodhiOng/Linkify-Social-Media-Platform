const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        // Find all users to be returned in the response
        const users = await User.find();

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single user by their username
exports.getUserByUsername = async (req, res) => {
    try {
        // Find user based on their username and verify their existence
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update the logged-in user's info
exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // If the password would like to be updated too, hash first it before updating
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } else {
            // The password field would not like to be updated
            delete req.body.password;
        }

        // Find the user by ID and update their information + verify their existence
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Deactivate a user account
exports.deleteUser = async (req, res) => {
    try {
        // Ensure the account is being deleted by the authorized user
        if (req.user.userId !== req.params.id) {
            return res.status(403).json({ message: 'You are not allowed to delete this user' });
        }

        // Find the to-be-deleted user by ID and delete it + confirm its existence
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};