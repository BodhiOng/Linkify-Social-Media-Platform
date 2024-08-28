const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    content: { type: String, required: true },
    image_url: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

postSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;