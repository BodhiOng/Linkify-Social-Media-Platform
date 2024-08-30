const rateLimit = {};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip; // Get the client's IP address
    
    // Initialize the rate limit data for the IP if it doesn't exist
    if (!rateLimit[ip]) {
        rateLimit[ip] = {
            requests: 0,
            firstRequestTime: Date.now()
        };
    }

    // Check if the time window has passed
    const timeSinceFirstRequest = Date.now() - rateLimit[ip].firstRequestTime;

    if (timeSinceFirstRequest < RATE_LIMIT_WINDOW_MS) {
        // If still within the time window, increment the request count
        rateLimit[ip].requests++;

        // Check if the request limit has been exceeded
        if (rateLimit[ip].requests > MAX_REQUESTS) {
            return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
    } else {
        // Reset the rate limit data after the time window
        rateLimit[ip] = {
            requests: 1,
            firstRequestTime: Date.now()
        };
    }

    // Call the next middleware or route handler
    next();
};

module.exports = rateLimitMiddleware;