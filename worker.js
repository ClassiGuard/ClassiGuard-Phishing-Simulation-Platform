import mongoose from 'mongoose';
import { Worker } from 'bullmq';
import { getRedisConnection } from './utils/redis.js';
import { runCampaignService, resendFailedEmailsService } from './services/campaignService.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const MONGO_URI = `mongodb://${process.env.MONGO_APP_USERNAME}:${process.env.MONGO_APP_PASSWORD}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE || 'cyphish'}?authSource=admin`;

mongoose.connect(MONGO_URI)
    .then(() => console.log('[Worker] Connected to MongoDB.'))
    .catch((err) => console.error('[Worker] MongoDB connection error:', err));

// Initialize BullMQ Worker
const worker = new Worker('campaign-execution', async (job) => {
    console.log(`[Worker] Processing job ${job.name} for campaign ${job.data.campaignId}`);
    
    if (job.name === 'run-campaign') {
        const { campaignId, origin } = job.data;
        await runCampaignService(campaignId, origin);
    } else if (job.name === 'resend-campaign') {
        const { campaignId } = job.data;
        await resendFailedEmailsService(campaignId);
    } else {
        throw new Error(`Unknown job name: ${job.name}`);
    }
}, {
    connection: getRedisConnection(),
    concurrency: 5 // Process up to 5 campaigns concurrently
});

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} (${job.name}) completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} (${job.name}) failed:`, err.message);
});

console.log('[Worker] Worker started. Listening for campaign execution jobs...');
