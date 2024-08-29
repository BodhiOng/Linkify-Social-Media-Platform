const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

// Create a new like
router.post('/', async (req, res) => {
    try {
        const { post_id, user_id } = req.body;

        // Check if post exists
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has already liked the post
        const existingLike = await Like.findOne({ post_id, user_id });
        if (existingLike) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }

        const like = new Like({
            post_id,
            user_id,
        });

        await like.save();

        // Increment likes count on the post
        post.likes_count += 1; 
        await post.save();

        res.status(201).json(like);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all likes for a specific post
router.get('/post/:postId', async (req, res) => {
    try {
        const likes = await Like.find({ post_id: req.params.postId }).populate('user_id', 'username');
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a like
router.delete('/:id', async (req, res) => {
    try {
        const like = await Like.findById(req.params.id);
        if (!like) {
            return res.status(404).json({ error: 'Like not found' });
        }

        const post = await Post.findById(like.post_id);
        if (post) {
            post.likes_count -= 1; 
            await post.save();
        }

        await like.remove();
        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;