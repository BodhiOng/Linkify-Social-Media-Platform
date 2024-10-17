const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, "Please provide a username"], 
        unique: true },
    email: { 
        type: String, 
        required: [true, "Please provide an email"], 
        unique: true },
    password: { 
        type: String, 
        required: [true, "Please provide a password"] },
    bio: { type: String },
    avatar_url: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);