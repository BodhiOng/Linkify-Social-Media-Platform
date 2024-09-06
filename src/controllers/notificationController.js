const Notification = require('../models//notificationModel');

// Get all notifications for a user
exports.getNotificationsForUser = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.params.userId });
        res.json(notifications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
