const Message = require('../models/messageModel');

// Retrieve messages between the authenticated user and another user
exports.getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;

        // Find messages between the authenticated user and the other user
        const messages = await Message.find({
            $or: [
                { senderId: req.user.userId, receiverId: otherUserId }, // Messages sent by the authenticated user
                { senderId: otherUserId, receiverId: req.user.userId } // Messages sent by the other user
            ]
        }).sort({ createdAt: 1 }); // Sort by oldest messages first

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send a message to another user
exports.sendMessage = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const { content } = req.body;

        // Create and save a new message
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
};

// Unsend a message
exports.deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;

        // Find the message to delete and make sure it was previously sent by the authenticated user
        const message = await Message.findOne({ _id: messageId, senderId: req.user.userId });
        if (!message) {
            return res.status(404).json({ error: 'Message not found or you do not have permission to delete it.' });
        }

        // Delete the message
        await message.deleteOne();

        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
