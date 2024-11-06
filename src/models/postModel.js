const mongoose = require('mongoose');
const { getOrCreateModel } = require('../utils/mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likes_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Post = getOrCreateModel('Post', postSchema);

module.exports = Post;