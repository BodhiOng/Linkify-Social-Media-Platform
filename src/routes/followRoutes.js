const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const verifyToken = require('../middlewares/authMiddleware');

// Follow a user
router.post('/', verifyToken, followController.followUser);

// Unfollow a user
router.delete('/', verifyToken, followController.unfollowUser);

// Get followers of a user
router.get('/followers/:username', followController.getFollowers);

// Get users that a user is following
router.get('/following/:username', followController.getFollowing);

module.exports = router;