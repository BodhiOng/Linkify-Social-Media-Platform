const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares//authMiddleware');
const Post = require('../models/postModel');

// GET /feed - Retrieve the home feed with posts from all users
router.get('/feed', verifyToken, async (req, res) => {
    try {
        // Find posts from all users
        const feedPosts = await Post.find({})
            .sort({ created_at: -1 }) // Sort by latest posts first
            .populate('userId', 'username') // Populate the username of the post creator
            .limit(20); // Limit the number of posts returned

        res.json(feedPosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;