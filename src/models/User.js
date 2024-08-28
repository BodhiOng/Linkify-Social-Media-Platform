const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    profile_picture_url: { type: String, default: '' },
    bio: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;