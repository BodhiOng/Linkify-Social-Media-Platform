const mongoose = require('mongoose');
const { getOrCreateModel } = require('../utils/mongoose');

const FollowSchema = new mongoose.Schema({
    follower_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    following_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'pending'],
        default: 'active'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Ensure unique follow relationship per follower and following
FollowSchema.index({ follower_id: 1, following_id: 1}, { unique: true });

const Follow = getOrCreateModel('Follow', FollowSchema);

module.exports = Follow;