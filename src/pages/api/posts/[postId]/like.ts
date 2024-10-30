import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../dbConnect'; 
import Post from '../../../../models/postModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        const { postId } = req.query;

        const post = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likes_count: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
}
