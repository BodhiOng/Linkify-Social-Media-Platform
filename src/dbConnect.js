const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
const dbConnect = () => mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 20000, // 20 seconds timeout
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
});

module.exports = dbConnect;