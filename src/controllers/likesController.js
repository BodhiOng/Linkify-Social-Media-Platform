const Like = require('../models/likeModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Create a new like
exports.createLike = async (req, res) => {
    try {
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

        // Create a notification for the post owner
        const postOwner = await User.findById(post.user_id);
        const notificationMessage = `${user.username} liked your post.`;
        const notification = new Notification({
            user_id: postOwner._id,
            type: 'like',
            entity_id: post._id,
            message: notificationMessage,
        });
        await notification.save();
        
        res.status(201).json(like);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all likes for a specific post
exports.getLikesByPost = async (req, res) => {
    try {
        const likes = await Like.find({ post_id: req.params.postId }).populate('user_id', 'username');
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a like
exports.deleteLikeById = async (req, res) => {
    try {
        const like = await Like.findById(req.params.id);
        if (!like) {
            return res.status(404).json({ error: 'Like not found' });
        }

        // Ensure the user is deleting their own like
        if (like.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not allowed to delete this like' });
        }

        const post = await Post.findById(like.post_id);
        if (post) {
            post.likes_count -= 1;
            await post.save();
        }

        await Like.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};