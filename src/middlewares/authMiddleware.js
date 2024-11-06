const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Check for token in different places (header, cookies, or Authorization header)
    const token = 
        req.header('x-auth-token') || 
        req.cookies.token ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'No token, authorization denied' 
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
        };

        next();
    } catch (err) {
        console.error('Token verification error:', err.message);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid token format',
                code: 'INVALID_TOKEN'
            });
        }

        res.status(401).json({ 
            success: false,
            error: 'Token verification failed',
            code: 'TOKEN_VERIFICATION_FAILED'
        });
    }
};

module.exports = authMiddleware;
