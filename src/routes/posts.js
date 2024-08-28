const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET /posts - Get a list of all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts - Create a new post
router.post('/', async (req, res) => {
    const post = new Post({
        content: req.body.content,
        image_url: req.body.image_url,
        author: req.body.author
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;