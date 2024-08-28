const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interactionSchema = new Schema({
    interaction_type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    target_user: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

const Interaction = mongoose.model('Interaction', interactionSchema);
module.exports = Interaction;