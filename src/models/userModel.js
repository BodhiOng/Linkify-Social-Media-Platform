const mongoose = require('mongoose');
const { getOrCreateModel } = require('../utils/mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    profile_picture: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const User = getOrCreateModel('User', userSchema);

module.exports = User;