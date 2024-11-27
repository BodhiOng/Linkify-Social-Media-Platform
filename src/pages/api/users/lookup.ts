import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../dbConnect";
import User from "../../../models/userModel";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        await dbConnect();

        const user = await User.findOne(
            { email: email.toLowerCase() },
            { username: 1, _id: 1 }
        );

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                username: null,
                userId: null
            });
        }

        return res.status(200).json({ 
            username: user.username,
            userId: user._id.toString(),
            message: 'Username found'
        });
    } catch (error) {
        console.error('Username lookup error:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            username: null,
            userId: null
        });
    }
}