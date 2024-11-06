import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../dbConnect';
import Post from '../../../../models/postModel';
import Like from '../../../../models/likeModel';
import User from '../../../../models/userModel';
import Notification from '../../../../models/notificationModel';

// Define a type for the decoded token
interface DecodedToken {
    userId: string;
    [key: string]: any;
}

export default async function likeHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const user_id = decoded.userId;

        await dbConnect();
        const post_id = req.query.postId as string;

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

        let isLiked: boolean;
        if (existingLike) {
            // Unlike the post
            await Like.deleteOne({ _id: existingLike._id });

            // Remove user from likes array and decrement likes count
            post.likes = post.likes.filter(id => id.toString() !== user_id);
            post.likes_count = Math.max(0, post.likes_count - 1);
            isLiked = false;
        } else {
            // Like the post
            const like = new Like({
                post_id,
                user_id,
            });
            await like.save();

            // Add user to likes array and increment likes count
            post.likes.push(user_id);
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

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.status(500).json({
            error: 'Server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}