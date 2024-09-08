const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const messageController = require('../controllers/messageController');

// Retrieve messages between the authenticated user and another user
router.get('/message/:userId', verifyToken, messageController.getMessages);

// Send a message to another user
router.post('/message/:userId', verifyToken, messageController.sendMessage);

// Unsend a message
router.delete('/message/:messageId', verifyToken, messageController.deleteMessage);

module.exports = router;