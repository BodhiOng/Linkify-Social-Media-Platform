import type { NextApiRequest, NextApiResponse } from "next";

interface SignUpResponse {
    success: boolean;
    message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

export default async function SignUpHandler(req: NextApiRequest, res: NextApiResponse<SignUpResponse>) {
    if (req.method == 'POST') {
        const { username, email, password } = req.body;

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                return res.status(200).json({ success: true, message: "Sign up successful" });
            } else {
                return res.status(400).json({ success: false, message: data.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: "An error occured"})
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}