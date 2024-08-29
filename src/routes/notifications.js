const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.params.userId });
        res.json(notifications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;