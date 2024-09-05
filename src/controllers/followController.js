const Follow = require('../models/followModel');
const User  =require('../models/userModel');

// Follow a user
exports.followUser = async (req, res) => {
    try {
        const followerUsername = req.user.username;
        const { followingUsername } = req.body;

        const follower = await User.findOne({ username: followerUsername });
        const following = await User.findOne({ username: followingUsername });

        if (!following) {
            return res.status(400).json({ error: 'User to follow not found' });
        }

        const existingFollow = await Follow.findOne({ follower_id: follower._id, following_id: following._id});
        if (existingFollow) {
            return res.status(400).json({ error: 'You are already following this user'});
        }

        const follow = new Follow({ follower_id: follower._id, following_id: following._id });
        await follow.save();

        res.status(201).json(follow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    try {
        const followerUsername = req.user.username;
        const { followingUsername } = req.body;

        const follower = await User.findOne({ username: followerUsername });
        const following = await User.findOne({ username: followingUsername });

        if (!following) {
            res.status(400).json({ error: 'User to unfollow not found' });
        }

        const follow = await Follow.findOneAndDelete({ follower_id: follower._id, following_id: following._id });
        if (!follow) {
            return res.status(404).json({ error: 'Follow relationship not found.' });
        }

        res.json({ message: 'Successfully unfollowed the user.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
    try {
        const followers = await Follow.find({ following_id: req.params.userId }).populate('follower_id', 'username');
        res.json(followers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get users that a user is following
exports.getFollowing = async (req, res) => {
    try {
        const following = await Follow.find({ follower_id: req.params.userId }).populate('following_id', 'username');
        res.json(following);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};