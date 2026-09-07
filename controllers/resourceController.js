import SenderProfile from '../models/SenderProfile.js';
import TelephonyProfile from '../models/TelephonyProfile.js';
import Audience from '../models/Audience.js';
import Template from '../models/Template.js';

export const getResourceOverview = async (req, res) => {
    try {
        const [senderProfiles, telephonyProfiles, audiences, templates] = await Promise.all([
            SenderProfile.find().sort({ createdAt: -1 }).select('_id senderName email'),
            TelephonyProfile.find().sort({ createdAt: -1 }).select('_id name provider callerId'),
            Audience.find().sort({ createdAt: -1 }).select('_id name contacts'),
            Template.find().sort({ createdAt: -1 }).select('_id name subject channel'),
        ]);

        res.status(200).json({
            success: true,
            data: {
                senderProfiles,
                telephonyProfiles,
                audiences,
                templates,
            },
            message: 'Resources fetched successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching resources: ' + error.message,
        });
    }
};
