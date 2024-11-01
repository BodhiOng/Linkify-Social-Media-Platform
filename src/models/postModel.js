const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    image_url: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);