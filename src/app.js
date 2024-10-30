// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const dbConnect = require('./dbConnect');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

nextApp.prepare().then(() => {
    // Create HTTP server
    const server = http.createServer(app);

    // Configure CORS
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    // Connect to MongoDB
    dbConnect();

    // Middleware setup
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimitMiddleware);
    app.use(cookieParser());

    // Add error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Something went wrong!' });
    });

    // Socket IO connection handling
    io.on('connection', (socket) => {
        console.log("A user connected");

        // Join a room for the user (with their user ID)
        socket.on('joinUser', (userId) => {
            socket.join(userId);
        });

        // Join a room for a post (using the post ID)
        socket.on('joinPost', (postId) => {
            socket.join(postId);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log("User disconnected");
        });
    });


    // API Routes
    const apiRouter = express.Router();
    
    apiRouter.use('/auth', require('./routes/authRoutes'));
    apiRouter.use('/users', require('./routes/userRoutes'));
    apiRouter.use('/posts', require('./routes/postRoutes'));
    apiRouter.use('/comments', require('./routes/commentRoutes'));
    apiRouter.use('/likes', require('./routes/likeRoutes'));
    apiRouter.use('/follows', require('./routes/followRoutes'));
    apiRouter.use('/notifications', require('./routes/notificationRoutes'));
    apiRouter.use('/messages', require('./routes/messagesRoutes'));
    apiRouter.use('/feed', require('./routes/feedRoutes'));

    // Mount API routes under /api
    app.use('/api', apiRouter);

    // Test route
    app.get('/api/test', (req, res) => {
        res.json({ message: "API is working" });
    });

    // Handle all other routes with Next.js
    app.all('*', (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Server running on http://localhost:${PORT}`);
    });

    app.set('io', io);
});