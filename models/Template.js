import mongoose from 'mongoose';
const { Schema } = mongoose;

const templateSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: function() { return this.channel === 'email'; },
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true,
        default: 'custom',
    },
    category: {
        type: String,
        trim: true,
        default: 'IT & Security',
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
    },
    tags: {
        type: [String],
        default: ['Phishing Drill'],
    },
    htmlContent: {
        type: String,
        required: function() { return this.channel === 'email'; },
    },
    sourceFormat: {
        type: String,
        enum: ['html', 'markdown', 'raw_eml'],
        default: 'html',
    },
    markdownContent: {
        type: String,
        default: '',
    },
    cssSettings: {
        type: Schema.Types.Mixed,
        default: null,
    },
    channel: {
        type: String,
        enum: ['email', 'voice'],
        default: 'email',
    },
    voiceSettings: {
        voiceType: { type: String, default: 'alice' }, // twilio voice type (man, woman, alice, amazon, etc)
        ttsMessage: { type: String, default: '' },
        gatherPrompt: { type: String, default: '' },
        audioUrl: { type: String, default: '' }
    }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;
