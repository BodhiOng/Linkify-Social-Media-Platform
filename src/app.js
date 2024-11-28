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
const { start } = require('repl');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

// Async wrapper to handle server initialization
async function startServer() {
    try {
        // Prepare Next.js app
        await nextApp.prepare();

        // Create HTTP server
        const server = http.createServer(app);

        // Configure Socket.IO
        const io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true
            }
        });

        // Connect to MongoDB
        await dbConnect();

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
            console.error('Unhandled Error:', err);
            res.status(500).json({ 
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' ? err.message : {} 
            });
        });

        // Socket IO connection handling
        io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Join a room for the user (with their user ID)
            socket.on('joinUser', (userId) => {
                if (userId) {
                    socket.join(userId);
                    console.log(`User ${userId} joined their personal room`);
                }
            });

            // Join a room for a post (using the post ID)
            socket.on('joinPost', (postId) => {
                if (postId) {
                    socket.join(postId);
                    console.log(`Joined post room: ${postId}`);
                }
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
            res.json({ 
                message: "API is working",
                environment: process.env.NODE_ENV
            });
        });
    
        // Handle all other routes with Next.js
        app.all('*', (req, res) => {
            return handle(req, res);
        });

        const PORT = process.env.PORT || 4000;
        server.listen(PORT, (err) => {
            if (err) throw err;
            console.log(`> Server running on http://localhost:${PORT}`);
            console.log(`> Environment: ${process.env.NODE_ENV}`);
        });

        // Attach io to app for global access
        app.set('io', io);

        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Invoke the server startup function
startServer();