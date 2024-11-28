import { NextApiRequest } from "next";

export function getTokenFromHeader(req: NextApiRequest): string | null {
    // Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const [bearer, token] = authHeader.split(' ');
        if (bearer.toLowerCase() === 'bearer' && token) {
            return token;
        }
    }

    // Check cookie
    const cookieToken = req.cookies.token;
    if (cookieToken) {
        return cookieToken;
    }

    // Check query parameters
    const queryToken = req.query.token as string;
    if (queryToken) {
        return queryToken;
    }

    return null;
}