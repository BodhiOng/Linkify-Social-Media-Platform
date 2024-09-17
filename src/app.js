require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');
const app = express();
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Import port and connectionstring from .env
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 20000, // 20 seconds timeout
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
});

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
})

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

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Sorry, page not found');
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Make io accessible to other modules
app.set('io', io);