// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications for a user
router.get('/:userId', notificationController.getNotificationsForUser);

// Mark a notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

module.exports = router;