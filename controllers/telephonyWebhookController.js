import CampaignTracking from '../models/CampaignTracking.js';
import Campaign from '../models/Campaign.js';
import Template from '../models/Template.js';
import { audit } from '../services/auditService.js';

// Helper to construct XML dynamically based on provider
const generateVoiceXML = (provider, template, gatherWebhookUrl) => {
    const { voiceSettings } = template;
    const tts = voiceSettings.ttsMessage || 'This is a test call.';
    const gatherPrompt = voiceSettings.gatherPrompt;

    if (provider === 'twilio') {
        let xml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;
        if (gatherPrompt) {
            xml += `<Gather action="${gatherWebhookUrl}" numDigits="4" timeout="10">`;
            xml += `<Say voice="${voiceSettings.voiceType || 'alice'}">${gatherPrompt}</Say>`;
            xml += `</Gather>`;
            xml += `<Say voice="${voiceSettings.voiceType || 'alice'}">We didn't receive any input. Goodbye.</Say>`;
        } else if (voiceSettings.audioUrl) {
            xml += `<Play>${voiceSettings.audioUrl}</Play>`;
        } else {
            xml += `<Say voice="${voiceSettings.voiceType || 'alice'}">${tts}</Say>`;
        }
        xml += `</Response>`;
        return xml;
    }

    if (provider === 'plivo') {
        let xml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;
        if (gatherPrompt) {
            xml += `<GetDigits action="${gatherWebhookUrl}" method="POST" numDigits="4" timeout="10">`;
            xml += `<Speak>${gatherPrompt}</Speak>`;
            xml += `</GetDigits>`;
            xml += `<Speak>We didn't receive any input. Goodbye.</Speak>`;
        } else if (voiceSettings.audioUrl) {
            xml += `<Play>${voiceSettings.audioUrl}</Play>`;
        } else {
            xml += `<Speak>${tts}</Speak>`;
        }
        xml += `</Response>`;
        return xml;
    }

    if (provider === 'vonage') {
        const ncco = [];
        if (gatherPrompt) {
            ncco.push({ action: 'talk', text: gatherPrompt, bargeIn: true });
            ncco.push({ action: 'input', type: ['dtmf'], dtmf: { maxDigits: 4, timeOut: 10 }, eventUrl: [gatherWebhookUrl], eventMethod: 'POST' });
        } else if (voiceSettings.audioUrl) {
            ncco.push({ action: 'stream', streamUrl: [voiceSettings.audioUrl] });
        } else {
            ncco.push({ action: 'talk', text: tts });
        }
        return JSON.stringify(ncco);
    }
};

export const answerWebhook = async (req, res) => {
    const { provider } = req.params;
    const { trackingId } = req.query;

    try {
        if (!trackingId) return res.status(400).send('Tracking ID required');
        
        const tracking = await CampaignTracking.findById(trackingId).populate('campaign');
        if (!tracking) return res.status(404).send('Not found');

        const template = await Template.findById(tracking.campaign.template);
        if (!template) return res.status(404).send('Template not found');

        // Build the URL for gathering DTMF
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const gatherWebhookUrl = `${protocol}://${host}/api/webhooks/voice/${provider}/gather?trackingId=${trackingId}`;

        const payload = generateVoiceXML(provider, template, gatherWebhookUrl);

        if (provider === 'vonage') {
            res.setHeader('Content-Type', 'application/json');
        } else {
            res.setHeader('Content-Type', 'text/xml');
        }
        return res.send(payload);
    } catch (err) {
        console.error(`[Webhook] Error in ${provider} answer webhook:`, err);
        return res.status(500).send('Server Error');
    }
};

export const gatherWebhook = async (req, res) => {
    const { provider } = req.params;
    const { trackingId } = req.query;
    
    // Twilio sends Digits, Plivo sends Digits, Vonage sends dtmf
    const digits = req.body.Digits || req.body.dtmf?.digits || req.body.dtmf;

    try {
        if (trackingId && digits) {
            await CampaignTracking.findByIdAndUpdate(trackingId, {
                status: 'key_pressed',
                dtmfDigits: String(digits)
            });
        }
    } catch (err) {
        console.error(`[Webhook] Error updating DTMF for ${trackingId}:`, err);
    }

    if (provider === 'vonage') {
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify([{ action: 'talk', text: 'Thank you. Goodbye.' }]));
    } else {
        res.setHeader('Content-Type', 'text/xml');
        let tag = provider === 'plivo' ? 'Speak' : 'Say';
        return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><${tag}>Thank you. Goodbye.</${tag}></Response>`);
    }
};

export const statusWebhook = async (req, res) => {
    const { provider } = req.params;
    const { trackingId } = req.query;

    // Map provider-specific statuses to our statuses
    // Twilio: initiated, ringing, answered, completed, failed, busy, no-answer, canceled
    // Plivo: ringing, in-progress, completed, failed, busy, no-answer, rejected
    // Vonage: started, ringing, answered, completed, busy, cancelled, failed, rejected
    
    const rawStatus = (req.body.CallStatus || req.body.status || req.body.CallState || '').toLowerCase();
    
    let mappedStatus = null;
    if (['initiated', 'started'].includes(rawStatus)) mappedStatus = 'call_initiated';
    if (['ringing'].includes(rawStatus)) mappedStatus = 'call_ringing';
    if (['answered', 'in-progress'].includes(rawStatus)) mappedStatus = 'call_answered';
    if (['completed'].includes(rawStatus)) mappedStatus = 'call_completed';
    if (['failed', 'busy', 'no-answer', 'canceled', 'cancelled', 'rejected'].includes(rawStatus)) mappedStatus = 'call_failed';

    try {
        if (trackingId && mappedStatus) {
            // Only update if we aren't overwriting a more "advanced" state like key_pressed
            const tracking = await CampaignTracking.findById(trackingId);
            if (tracking && tracking.status !== 'key_pressed') {
                tracking.status = mappedStatus;
                await tracking.save();
            }
        }
    } catch (err) {
        console.error(`[Webhook] Error mapping status ${rawStatus} for ${trackingId}:`, err);
    }

    res.status(200).send('OK');
};
