const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },  // e.g., 'like', 'follow', 'comment'
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);