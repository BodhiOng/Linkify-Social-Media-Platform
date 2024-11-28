import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokenFromHeader } from '../../../../utils/authUtils';

interface FollowResponse {
    success: boolean;
    message?: string;
    isFollowing?: boolean;
    error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {    
        // Get token from request header
        const token = getTokenFromHeader(req);
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        // Get the target username from the query
        const { username } = req.query;

        // Make request to the backend follow toggle endpoint
        const response = await fetch(`${API_URL}/follows/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ followingUsername: username })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: data.message,
                isFollowing: data.isFollowing
            });
        } else {
            return res.status(response.status).json({
                success: false,
                error: "An error occured while processing the follow request"
            })
        }
    } catch (error) {
        console.error('Follow error:', error);
        return res.status(500).json({
            success: false, 
            error: 'An error occured while processing the follow request' 
        });
    }
}