const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');

router.get('/', async (req, res) => {
    try {
        // const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Simple query without user-specific data
        const posts = await Post.find()
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'username')
            .lean();

        const totalPosts = await Post.countDocuments();
        const hasMore = totalPosts > skip + posts.length;

        // Transform posts to match frontend interface if needed
        const transformedPosts = posts.map(post => ({
            _id: post._id,
            user_id: post.user_id._id,
            content: post.content,
            username: post.user_id.username,
            image_url: post.image_url || '',
            created_at: post.created_at,
            updated_at: post.updated_at,
            likes: post.likes,
            likes_count: post.likes_count,
            comments_count: post.comments_count,
        }));

        res.json({
            posts: transformedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasMore
        });
    } catch (error) {
        console.error('Feed Error:', error);
        res.status(500).json({ message: 'Error fetching feed' });
    }
});

// Simplified like route without auth
router.post('/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;

        // Simply increment the likes_count
        await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes_count: 1 } },
            { new: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Like Error:', error);
        res.status(500).json({
            message: 'Error liking post',
            error: error.message
        });
    }
});

module.exports = router;