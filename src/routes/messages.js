const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const verifyToken = require('../middlewares/auth');


// GET /messages/:userId - Retrieve messages between the authenticated user and another user
router.get('/messages/:userId', verifyToken, async (req, res) => {
    try {
        const otherUserId = req.params.userId;

        // Find messages between the authenticated user and the specified user
        const messages = await Message.find({
            $or: [
                { senderId: req.user.userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: req.user.userId }
            ]
        }).sort({ createdAt: 1 }); // Sort by oldest messages first

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /messages/:userId - Send a message to another user
router.post('/messages/:userId', verifyToken, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const { content } = req.body;

        // Create a new message
        const message = new Message({
            senderId: req.user.userId,
            receiverId: otherUserId,
            content
        });

        await message.save();

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /messages/:messageId - Delete a message
router.delete('/messages/:messageId', verifyToken, async (req, res) => {
    try {
        const messageId = req.params.messageId;

        // Find the message and ensure the authenticated user is the sender
        const message = await Message.findOne({ _id: messageId, senderId: req.user.userId });
        if (!message) {
            return res.status(404).json({ error: 'Message not found or you do not have permission to delete it.' });
        }

        await message.remove();

        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;