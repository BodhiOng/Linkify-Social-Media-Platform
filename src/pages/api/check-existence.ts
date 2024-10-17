import type { NextApiRequest, NextApiHandler, NextApiResponse } from "next";
import dbConnect from "../../dbConnect";
import User from "../../models/userModel";

export default async function checkExistenceHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, email } = req.query

    if(!username && !email) {
        return res.status(400).json({ message: "Username or email is required" });
    }

    try {
        await dbConnect();

        let query = {};
        if (username) {
            query = { username: username };
        } else if (email) {
            query = { email: email };
        }

        const user = await User.findOne(query);

        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error during checking existence: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}