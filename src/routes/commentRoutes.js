const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Create a new comment
router.post('/', commentController.createComment);

// Get all comments for a specific post
router.get('/post/:postId', commentController.getCommentsByPost);

// Update a comment
router.put('/:id', commentController.updateCommentById);

// Delete a comment
router.delete('/:id', commentController.deleteCommentById);

module.exports = router;