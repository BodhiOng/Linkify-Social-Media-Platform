const express = require('express');
const router = express.Router();
const Follow = require('../models/followModel');

// Follow a user
router.post('/', async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;

        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({ follower_id, following_id });
        if (existingFollow) {
            return res.status(400).json({ error: 'You are already following this user.' });
        }

        const follow = new Follow({ follower_id, following_id });
        await follow.save();
        res.status(201).json(follow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Unfollow a user
router.delete('/', async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;

        const follow = await Follow.findOneAndDelete({ follower_id, following_id });
        if (!follow) {
            return res.status(404).json({ error: 'Follow relationship not found.' });
        }

        res.json({ message: 'Successfully unfollowed the user.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get followers of a user
router.get('/followers/:userId', async (req, res) => {
    try {
        const followers = await Follow.find({ following_id: req.params.userId }).populate('follower_id', 'username');
        res.json(followers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get users that a user is following
router.get('/following/:userId', async (req, res) => {
    try {
        const following = await Follow.find({ follower_id: req.params.userId }).populate('following_id', 'username');
        res.json(following);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;