const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.userId;

        const newPost = new Post({
            user_id,
            content,
            image_url: req.file ? req.file.path : null // Save image path
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('_id', 'username');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get posts by username
exports.getPostsByUsername = async (req, res) => {
    try {
        const posts = await Post.find({ user_id: req.params.username }).populate('user_id', 'username');
        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a post by ID
exports.updatePostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not allowed to update this post' });
        }

        const { content } = req.body;
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { content, updated_at: Date.now() },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a post by ID
exports.deletePostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not allowed to delete this post' });
        }

        await post.remove();
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};