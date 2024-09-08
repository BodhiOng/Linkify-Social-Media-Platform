const Notification = require('../models/notificationModel');
const ObjectId = require('mongoose').Types.ObjectId;

// Get all notifications for a user
exports.getNotificationsForUser = async (req, res) => {
    try {
        // Extract userId from the token
        const userId = req.user.userId;

        // Check if userId exists
        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in token' });
        }

        // Mark all unread notifications as read
        const updateResult = await Notification.updateMany(
            { user_id: new ObjectId(userId), isRead: false },
            { $set: { isRead: true } }
        );

        // Fetch all notifications for the user
        const notifications = await Notification.find({ user_id: new ObjectId(userId) });

        // Check if notifications exist
        if (notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found for this user' });
        }

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};