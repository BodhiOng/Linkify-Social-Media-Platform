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

// Determine if we're in development or production mode
const dev = process.env.NODE_ENV !== 'production';

// Initialize Next.js app
const nextApp = next({ dev });

// Get Next.js request handler
const handle = nextApp.getRequestHandler();

// Create Express app
const app = express();

nextApp.prepare().then(() => {
    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server);

    // Connect to MongoDB
    dbConnect();

    // Middleware setup
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimitMiddleware);
    app.use(cookieParser());

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

    // Routes setup
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const postRoutes = require('./routes/postRoutes');
    const commentRoutes = require('./routes/commentRoutes');
    const likeRoutes = require('./routes/likeRoutes');
    const followRoutes = require('./routes/followRoutes');
    const notificationRoutes = require('./routes/notificationRoutes');
    const feedRoutes = require('./routes/feedRoutes');
    const messageRoutes = require('./routes/messagesRoutes');
    
    app.use('/', feedRoutes);
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/posts', postRoutes);
    app.use('/comments', commentRoutes);
    app.use('/likes', likeRoutes);
    app.use('/follows', followRoutes);
    app.use('/notifications', notificationRoutes);
    app.use('/messages', messageRoutes);
    
    // Test route
    app.get('/test', (req, res) => {
        res.json({ message: "Test route is working" });
    });

    // Handle all other routes with Next.js
    app.all('*', (req, res) => {
        handle(req, res);
    });
    
    // Starting the server
    server.listen(port = 4000, (err) => {
        if (err) throw err;
        console.log(`Server is running on port ${port}`);
    });
    
    // Make io accessible to other modules
    app.set('io', io);
});