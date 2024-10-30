const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
});

LikeSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);