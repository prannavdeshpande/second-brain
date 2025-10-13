const User = require('../models/User');
const Activity = require('../models/Activity');
const Content = require('../models/Content');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscription');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/user/activity
exports.getActivity = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user.id })
            .populate('content', 'title')
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/user/stats
exports.getStats = async (req, res) => {
    try {
        const totalContents = await Content.countDocuments({ user: req.user.id });
        const favorites = await Content.countDocuments({ user: req.user.id, isFavorite: true });
        const shared = await Content.countDocuments({ user: req.user.id, 'sharedWith.0': { $exists: true } });
        
        res.status(200).json({ success: true, data: { totalContents, favorites, shared } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};