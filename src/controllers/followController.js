const Follow = require('../models/followModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { default: mongoose } = require('mongoose');

exports.toggleFollow = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const followerId = req.user.userId;
        const { followingUsername } = req.body;

        // Find the follower and the followed user
        const follower = await User.findById(followerId);
        const following = await User.findOne({ username: followingUsername });

        if (!follower || !following) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'User not found' });
        }

        if(follower._id.equals(following._id)) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }

        // Check existing follow relationship
        const existingFollow = await Follow.findOne({
            follower_id: follower._id,
            following_id: following._id
        });

        if (existingFollow) {
            // Unfollow
            await Follow.findOneAndDelete({
                follower_id: follower._id,
                following_id: following._id
            });

            // Remove from followers and following arrays
            await User.findByIdAndUpdate({
                $pull: { followers: follower._id }
            });

            await User.findByIdAndUpdate({
                $pull: { following: following._id }
            })

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: 'Successfully unfollowed user',
                isFollowing: false
            });
        } else {
            // Follow
            const newFollow = new Follow({
                follower_id: follower._id,
                following_id: following._id
            });
            await newFollow.save();

            // Add to followers and following arrays
            await User.findByIdAndUpdate(following._id, {
                $addToSet: { followers: follower._id }
            });

            await User.findByIdAndUpdate(follower._id, {
                $addToSet: { following: following._id }
            });

            // Create notification
            const notification = new Notification({
                user_id: following._id,
                type: 'follow',
                entity_id: follower._id,
                message: `${follower.username} started following you`
            });
            await notification.save();

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: 'Successfully followed user',
                isFollowing: true
            });
        } 
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
    }
}

// Get a list of a user's followers
exports.getFollowers = async (req, res) => {
    try {
        const username = req.params.username || req.user.username;
        const user = await User.findOne({ username });

        // Check the user's existence
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find and populate the list of the user's followers
        const followers = await Follow.find({ following_id: user._id }).populate('follower_id', 'username');
        res.json(followers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get the following list of a user
exports.getFollowing = async (req, res) => {
    try {
        const username = req.params.username || req.user.username;
        const user = await User.findOne({ username });

        // Check for the user's existence
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = await Follow.find({ follower_id: user._id }).populate('following_id', 'username');
        res.json(following);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};