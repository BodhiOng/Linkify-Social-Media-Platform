const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post_id = req.params.postId;
        const user_id = req.user.userId;

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

        // Create a notification for the post owner
        const postOwner = await User.findById(post.user_id);
        const notificationMessage = `${user.username} commented on your post.`;
        const notification = new Notification({
            user_id: postOwner._id,
            type: 'comment',
            entity_id: comment._id,
            message: notificationMessage,
        });
        await notification.save();

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

// Delete a comment
exports.deleteCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Ensure the comment belongs to the authenticated user
        if (comment.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not allowed to delete this comment' });
        }

        const post = await Post.findById(comment.post_id);
        if (post) {
            post.comments_count -= 1;
            await post.save();
        }

        await Comment.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};