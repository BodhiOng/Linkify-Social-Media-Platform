const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Ensure the token is inputted in the headers
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify the JWT token directly without decryption
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded payload to the request object
        req.user = decoded; 
        next();
    } catch (err) {
        // Warning message in case token had expired already
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }

        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = verifyToken;