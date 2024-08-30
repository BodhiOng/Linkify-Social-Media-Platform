require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimitMiddleware = require('./middlewares/rateLimit');
const app = express();

// Import port and connectionstring from .env
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
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

// Routes setup
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const followRoutes = require('./routes/follow');
const notificationRoutes = require('./routes/notifications');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/follow', followRoutes);
app.use('/notifications', notificationRoutes);

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