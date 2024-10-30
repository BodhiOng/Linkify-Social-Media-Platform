const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Get total count first
        const totalPosts = await Post.countDocuments();

        // Fetch posts with pagination
        const posts = await Post.find({})
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'username')
            .lean();

        // Calculate if there are more posts
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
            likes_count: post.likes_count,
            comments_count: post.comments_count
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

module.exports = router;