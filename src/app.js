const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dharma-social-media', {
    serverSelectionTimeoutMS: 20000, // 20 seconds timeout
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));


// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes setup
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');

app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Sorry, page not found');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});