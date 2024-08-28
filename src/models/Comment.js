const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment_text: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

commentSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;