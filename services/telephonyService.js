import twilio from 'twilio';
import * as plivo from 'plivo';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';

/**
 * Dispatches an outbound call using the specified telephony profile.
 * 
 * @param {Object} profile The populated TelephonyProfile document
 * @param {String} toPhoneNumber The victim's phone number (E.164 format)
 * @param {String} webhookUrl The public URL to fetch TwiML/NCCO/Plivo XML from when answered
 * @param {String} statusCallbackUrl The public URL to send call status updates to
 * @param {String} trackingId The tracking ID to link this call to a campaign contact
 * @returns {Promise<Object>} Object containing the provider's call ID
 */
export async function makeOutboundCall(profile, toPhoneNumber, webhookUrl, statusCallbackUrl, trackingId) {
    const { provider, credentials, callerId } = profile;

    if (provider === 'twilio') {
        const client = twilio(credentials.accountSid, credentials.authToken);
        
        // Twilio requires tracking ID or context in the URL params
        const urlWithContext = `${webhookUrl}?trackingId=${trackingId}`;
        const statusUrlWithContext = `${statusCallbackUrl}?trackingId=${trackingId}`;

        const call = await client.calls.create({
            url: urlWithContext,
            to: toPhoneNumber,
            from: callerId,
            statusCallback: statusUrlWithContext,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            statusCallbackMethod: 'POST',
        });
        
        return { callId: call.sid, status: 'initiated' };
    } 
    
    else if (provider === 'plivo') {
        const client = new plivo.Client(credentials.authId, credentials.authToken);
        
        const urlWithContext = `${webhookUrl}?trackingId=${trackingId}`;
        const statusUrlWithContext = `${statusCallbackUrl}?trackingId=${trackingId}`;

        const call = await client.calls.create(
            callerId,
            toPhoneNumber,
            urlWithContext,
            {
                method: 'POST',
                callback_url: statusUrlWithContext,
                callback_method: 'POST',
            }
        );
        
        return { callId: call.requestUuid, status: 'initiated' };
    } 
    
    else if (provider === 'vonage') {
        const credentialsObj = new Auth({
            apiKey: credentials.apiKey,
            apiSecret: credentials.apiSecret,
            applicationId: credentials.applicationId,
            privateKey: credentials.privateKey, // Requires PKCS8 private key string
        });
        const vonage = new Vonage(credentialsObj);

        const urlWithContext = `${webhookUrl}?trackingId=${trackingId}`;
        const statusUrlWithContext = `${statusCallbackUrl}?trackingId=${trackingId}`;

        const response = await vonage.voice.createOutboundCall({
            to: [{ type: 'phone', number: toPhoneNumber }],
            from: { type: 'phone', number: callerId },
            answerUrl: [urlWithContext],
            eventUrl: [statusUrlWithContext],
            eventMethod: 'POST'
        });

        return { callId: response.uuid, status: 'initiated' };
    }

    throw new Error(`Unsupported telephony provider: ${provider}`);
}
