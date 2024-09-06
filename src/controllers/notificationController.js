const Notification = require('../models/notificationModel');

// Get all notifications for a user
exports.getNotificationsForUser = async (req, res) => {
    try {
        // Extract userId from the token
        const userId = req.user.userId;

        // Mark all unread notifications as read
        await Notification.updateMany(
            { user_id: userId, read: false },
            { $set: { read: true } }
        );

        // Fetch all notifications for the user
        const notifications = await Notification.find({ user_id: userId });
        res.json(notifications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};