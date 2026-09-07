import mongoose from 'mongoose';
const { Schema } = mongoose;

const telephonyProfileSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    provider: {
        type: String,
        enum: ['twilio', 'plivo', 'vonage'],
        required: true
    },
    callerId: {
        type: String,
        required: true,
        trim: true,
        description: 'The registered phone number making the calls (E.164 format)'
    },
    credentials: {
        // Twilio & Plivo: { accountSid, authToken }
        // Vonage: { apiKey, apiSecret, applicationId, privateKey }
        type: Schema.Types.Mixed,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const TelephonyProfile = mongoose.model('TelephonyProfile', telephonyProfileSchema);
export default TelephonyProfile;
