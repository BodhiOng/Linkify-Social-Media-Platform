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

        // Create the new comment & save it
        const comment = new Comment({
            post_id,
            user_id,    
            content,
        });
        await comment.save();

        // Increment comments count on the post
        post.comments_count += 1;
        await post.save();

        // Fetch the post owner's information
        const postOwner = await User.findById(post.user_id);

        // Construct notification message for the post owner
        const notificationMessage = `${user.username} commented on your post: "${post.content}"`;
        
        // Create comment notification on the post owner's end
        const notification = new Notification({
            user_id: postOwner._id,
            type: 'comment',
            entity_id: comment._id,
            message: notificationMessage,
            post_image_url: post.image_url,
        });
        await notification.save();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(post_id.toString()).emit('newComment', {
                comment: {
                    _id: comment._id,
                    content: comment.content,
                    user: {
                        _id: user._id,
                        username: user.username
                    },
                    created_at: comment.created_at
                },
                post_id: post_id
            });

            // Emit notification to post owner
            io.to(postOwner._id.toString()).emit('newNotification', {
                notification: {
                    _id: notification._id,
                    type: notification.type,
                    message: notification.message,
                    createdAt: notification.createdAt
                }
            });
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error in createComment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all comments for a specific post
exports.getCommentsByPost = async (req, res) => {
    try {
        // Fetch all comments on the specific post
        const comments = await Comment.find({ post_id: req.params.postId }).populate('user_id', 'username');
        
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a comment
exports.deleteCommentById = async (req, res) => {
    try {
        // Find comment by its ID
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Ensure the comment belongs to the authenticated user
        if (comment.user_id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not allowed to delete this comment' });
        }

        //  Find the associated post and decrement the comment count
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