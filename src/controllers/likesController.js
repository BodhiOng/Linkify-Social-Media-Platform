const Like = require('../models/likeModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Create a new like
exports.createLike = async (req, res) => {
    try {
        const post_id = req.params.postId;
        const user_id = req.user.userId;

        // Check if the post exists
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has already liked the post
        const existingLike = await Like.findOne({ post_id, user_id });
        if (existingLike) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }

        // Create and save a new like
        const like = new Like({
            post_id,
            user_id,
        });
        await like.save();

        // Increment likes count on the post
        post.likes_count += 1;
        await post.save();

        // Fetch post owner's information
        const postOwner = await User.findById(post.user_id);

        // Create a notification message
        const notificationMessage = `${user.username} liked on your post: "${post.content}"`;

        // Create a like comment on the post owner's end
        const notification = new Notification({
            user_id: postOwner._id,
            type: 'like',
            entity_id: like._id,
            message: notificationMessage,
            post_image_url: post.image_url,
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
        // Find all likes in a specific post and populate with usernames of the likers
        const likes = await Like.find({ post_id: req.params.postId }).populate('user_id', 'username');
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a like
exports.deleteLikeById = async (req, res) => {
    try {
        // Find the like by its ID
        const like = await Like.findById(req.params.id);
        if (!like) {
            return res.status(404).json({ error: 'Like not found' });
        }

        // Ensure the like belongs to the authenticated user
        if (like.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not allowed to delete this like' });
        }

        // Find the associated post and decrement the likes count
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