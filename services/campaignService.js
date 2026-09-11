// src\services\campaignService.js
import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import CampaignTracking from '../models/CampaignTracking.js';

import { sendMultipleEmails } from './emailService.js';
import { makeOutboundCall } from './telephonyService.js';
import { sendTeamsCampaignAlert } from './teamsService.js';
import pLimit from 'p-limit';

/**
 * Service to run the campaign and send emails
 */
export const runCampaignService = async (id, origin) => {
    try {
        const campaignId = new mongoose.Types.ObjectId(String(id));
        const campaign = await Campaign.findById(id).populate('senderProfile template telephonyProfile');
        if (!campaign) {
            console.error('Campaign not found');
            return;
        }

        const { senderProfile, telephonyProfile, template, emailConcurrency, timeDelay, channel } = campaign;
        const limit = pLimit(emailConcurrency || 1);
        const trackingEntries = await CampaignTracking.find({ campaign: campaignId, status: 'pending' }).populate('contact');

        if (channel === 'voice') {
            await Promise.all(trackingEntries.map(entry =>
                limit(async () => {
                    const phoneNumber = entry.contact.phoneNumber;
                    if (!phoneNumber) {
                        await CampaignTracking.findByIdAndUpdate(entry._id, { status: 'failed', errorDetail: 'No phone number' });
                        return;
                    }
                    if (timeDelay > 0) {
                        await new Promise(resolve => setTimeout(resolve, timeDelay * 1000));
                    }
                    try {
                        const answerUrl = `${origin}/api/webhooks/voice/${telephonyProfile.provider}/answer`;
                        const statusUrl = `${origin}/api/webhooks/voice/${telephonyProfile.provider}/status`;
                        await makeOutboundCall(telephonyProfile, phoneNumber, answerUrl, statusUrl, entry._id);
                    } catch (err) {
                        console.error('Failed to dispatch call:', err);
                        await CampaignTracking.findByIdAndUpdate(entry._id, { status: 'failed' });
                    }
                })
            ));
        } else {
            // Wait for all emails to be sent
            await Promise.all(trackingEntries.map(entry =>
                limit(async () => {
                    await sendMultipleEmails(entry, senderProfile, template, timeDelay, origin);
                })
            ));
        }

        // Update campaign status to 'completed' after all emails are sent
        const completedCampaign = await Campaign.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
        console.log(`Campaign ${id} completed successfully.`);
        await sendTeamsCampaignAlert(completedCampaign, 'finished');

    } catch (error) {
        console.error('Error processing campaign emails:', error.message);
    }
};

/**
 * Service to resend failed emails for a campaign
 */
export const resendFailedEmailsService = async (id) => {
    try {
        const campaignId = new mongoose.Types.ObjectId(String(id));
        const campaign = await Campaign.findById(id).populate('senderProfile template');
        if (!campaign) {
            console.error('Campaign not found');
            return;
        }

        const { senderProfile, template, emailConcurrency, timeDelay } = campaign;
        const limit = pLimit(emailConcurrency || 1);

        // Find all failed email records
        const failedEntries = await CampaignTracking.find({ campaign: campaignId, status: 'failed' }).populate('contact');
        if (failedEntries.length === 0) {
            console.log(`No failed emails to resend for campaign ${id}`);
            return;
        }

        console.log(`Resending ${failedEntries.length} failed emails for campaign ${id}`);

        // Resend each failed email
        await Promise.all(failedEntries.map(entry =>
            limit(async () => {
                try {
                    await sendMultipleEmails(entry, senderProfile, template, timeDelay || 0);
                } catch (err) {
                    console.error(`Failed to resend email to ${entry.email}:`, err.message);
                }
            })
        ));

        console.log(`Resending failed emails for campaign ${id} completed.`);

    } catch (error) {
        console.error('Error resending failed emails:', error.message);
    }
};