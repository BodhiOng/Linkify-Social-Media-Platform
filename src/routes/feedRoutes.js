const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');

router.get('/', async (req, res) => {
    try {
        // const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // // Get posts with populated user data and like status
        // const posts = await Post.aggregate([
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'user_id',
        //             foreignField: '_id',
        //             as: 'user'
        //         }
        //     },
        //     { $unwind: '$user' },
        //     {
        //         $lookup: {
        //             from: 'likes',
        //             let: { postId: '$_id' },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ['$post_id', '$$postId'] },
        //                                 { $eq: ['$user_id', userId] }
        //                             ]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: 'userLike'
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             user_id: '$user._id',
        //             username: '$user.username',
        //             content: 1,
        //             image_url: 1,
        //             likes_count: 1,
        //             comments_count: 1,
        //             is_liked: { $gt: [{ $size: '$userLike' }, 0] }
        //         }
        //     },
        //     { $sort: { created_at: -1 } },
        //     { $skip: skip },
        //     { $limit: limit }
        // ]);

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
            likes_count: post.likes_count,
            comments_count: post.comments_count,
            is_liked: false
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

// router.post('/:postId/like', async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const userId = req.user.userId;

//         const like = await Like.findOne({ post_id: postId, user_id: userId });

//         if (like) {
//             // Unlike
//             await Like.deleteOne({ _id: like._id });
//             await Post.updateOne(
//                 { _id: postId },
//                 { $inc: { likes_count: -1 } }
//             );
//             res.json({ liked: false });
//         } else {
//             // Like
//             await Like.create({ post_id: postId, user_id: userId });
//             await Post.updateOne(
//                 { _id: postId },
//                 { $inc: { likes_count: 1 } }
//             );
//             res.json({ liked: true });
//         }
//     } catch (error) {
//         console.error('Like Error:', error);
//         res.status(500).json({ message: 'Error toggling like' });
//     }
// });

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