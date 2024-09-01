const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { post_id, user_id, content } = req.body;

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

        const comment = new Comment({
            post_id,
            user_id,
            content,
        });

        await comment.save();

        // Increment comments count on the post
        post.comments_count += 1;
        await post.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all comments for a specific post
exports.getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.postId }).populate('user_id', 'username');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a comment
exports.updateCommentById = async (req, res) => {
    try {
        const { content } = req.body;

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.content = content;
        comment.updated_at = Date.now();

        await comment.save();
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a comment
exports.deleteCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const post = await Post.findById(comment.post_id);
        if (post) {
            post.comments_count -= 1;
            await post.save();
        }

        await comment.remove();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
