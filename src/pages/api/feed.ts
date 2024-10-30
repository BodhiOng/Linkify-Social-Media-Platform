import type { NextApiRequest, NextApiResponse } from 'next';
const dbConnect = require('../../dbConnect');  
import Post from '../../models/postModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({})
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json(posts);
    } catch (error) {
        console.error('Feed API Error:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
}
