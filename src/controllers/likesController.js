const Like = require('../models/likeModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Unified Like/Unlike endpoint
exports.toggleLike = async (req, res) => {
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

        let isLiked;
        if (existingLike) {
            // Unlike the post
            await Like.deleteOne({ _id: existingLike._id });
            
            // Decrement likes count on the post
            post.likes_count = Math.max(0, post.likes_count - 1);
            isLiked = false;
        } else {
            // Like the post
            const like = new Like({
                post_id,
                user_id,
            });
            await like.save();

            // Increment likes count on the post
            post.likes_count += 1;
            isLiked = true;

            // Create notification for post owner
            const postOwner = await User.findById(post.user_id);
            if (postOwner && postOwner._id.toString() !== user_id) {
                const notificationMessage = `${user.username} liked your post: "${post.content}"`;
                
                const notification = new Notification({
                    user_id: postOwner._id,
                    type: 'like',
                    entity_id: like._id,
                    message: notificationMessage,
                    post_image_url: post.image_url,
                });
                await notification.save();
            }
        }

        // Save the updated post
        await post.save();

        return res.status(200).json({ 
            message: isLiked ? 'Post liked successfully' : 'Post unliked successfully', 
            liked: isLiked,
            likes_count: post.likes_count 
        });

    } catch (error) {
        console.error('Like/Unlike error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};