const Message = require('../models/messageModel');

// Retrieve messages between the authenticated user and another user
exports.getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;

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
};

// Send a message to another user
exports.sendMessage = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const { content } = req.body;

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

        const message = await Message.findOne({ _id: messageId, senderId: req.user.userId });
        if (!message) {
            return res.status(404).json({ error: 'Message not found or you do not have permission to delete it.' });
        }

        await message.deleteOne();

        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
