const mongoose = require('mongoose');
const { getOrCreateModel } = require('../utils/mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment'],
        required: true,
    },
    entity_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    post_image_url: {
        type: String,
        default: '',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = getOrCreateModel('Notification', notificationSchema);

module.exports = Notification;