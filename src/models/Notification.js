const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    notification_type: { type: String, required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
