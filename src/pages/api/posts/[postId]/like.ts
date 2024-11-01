import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../dbConnect';
import Post from '../../../../models/postModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        await dbConnect();
        const { postId } = req.query;

        // Check if user already liked the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Assuming you have a likes array in your post model
        if (post.likes.includes(userId)) {
            // Unlike if already liked
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { 
                    $pull: { likes: userId },
                    $inc: { likes_count: -1 }
                },
                { new: true }
            );
            return res.status(200).json(updatedPost);
        }

        // Add like if not already liked
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { 
                $addToSet: { likes: userId },
                $inc: { likes_count: 1 }
            },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
}
