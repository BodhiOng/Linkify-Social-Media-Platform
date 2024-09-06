const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middlewares/authMiddleware');

// Get all notifications for a user
router.get('/', verifyToken, notificationController.getNotificationsForUser); 

module.exports = router;