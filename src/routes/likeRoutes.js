const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likesController');

// Toggle like
router.post('/post/:postId', likeController.toggleLike);

module.exports = router;