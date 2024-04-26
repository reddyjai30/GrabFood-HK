const Profile = require('../model/profileModel');
const User = require('../model/userModel');

// Create or update a user's profile
exports.createOrUpdateProfile = async (req, res) => {
    const { name, email, phoneNo, address } = req.body;

    // Validate user context
    if (!req.user || !req.user.id) {
        return res.status(400).json({ message: 'User context is missing. Authentication might have failed.' });
    }

    try {
        const userId = req.user.id;

        // Use upsert option to create or update in one operation
        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: { name, email, phoneNo, address } },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        res.json(profile);
    } catch (error) {
        console.error('Error creating or updating profile:', error);
        res.status(500).json({ message: 'Error creating or updating profile', error: error.message });
    }
};

// Retrieve the authenticated user's profile
exports.getUserProfile = async (req, res) => {
    // Validate user context
    if (!req.user || !req.user.id) {
        return res.status(400).json({ message: 'User context is missing. Authentication might have failed.' });
    }

    try {
        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId }).populate('user', '-password');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
