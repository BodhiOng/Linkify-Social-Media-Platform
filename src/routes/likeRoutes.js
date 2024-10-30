const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likesController');
const verifyToken = require('../middlewares/authMiddleware');

// Create a new like
router.post('/post/:postId', likeController.createLike);

// Get all likes for a specific post
router.get('/post/:postId', likeController.getLikesByPost);

// Delete a like
router.delete('/:id', verifyToken, likeController.deleteLikeById);

module.exports = router;