import TelephonyProfile from '../models/TelephonyProfile.js';

export const getProfiles = async (req, res) => {
    try {
        const profiles = await TelephonyProfile.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProfile = async (req, res) => {
    try {
        const profile = await TelephonyProfile.create(req.body);
        res.status(201).json({ success: true, data: profile });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const profile = await TelephonyProfile.findByIdAndDelete(req.params.id);
        if (!profile) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
