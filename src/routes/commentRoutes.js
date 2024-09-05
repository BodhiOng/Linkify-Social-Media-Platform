const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const verifyToken = require('../middlewares/authMiddleware');

// Create a new comment
router.post('/post/:postId', verifyToken, commentController.createComment);

// Get all comments for a specific post
router.get('/post/:postId', commentController.getCommentsByPost);

// Delete a comment
router.delete('/:id', verifyToken, commentController.deleteCommentById);

module.exports = router;