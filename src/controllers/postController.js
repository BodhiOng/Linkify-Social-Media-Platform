const Post = require('../models/postModel');
const User = require('../models/userModel');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.userId;

        // Create a new post and save it
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
        // Find all posts
        const posts = await Post.find().populate('user_id', 'username');

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get posts by username
exports.getPostsByUsername = async (req, res) => {
    try {
        // Search a user based on their username and confirm its existence
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Looks for post posted by user and return message if there's no post posted before
        const posts = await Post.find({ user_id: user._id }).populate('user_id', 'username');
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
        // Searches for post and confirms its existence
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify that the authorized user is the only one trying to update the post
        if (post.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not allowed to update this post' });
        }

        const { content } = req.body;

        // Search & Update the post intended for modification
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { content },
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

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};