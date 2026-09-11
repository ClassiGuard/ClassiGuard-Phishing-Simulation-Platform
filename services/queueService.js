import { Queue } from 'bullmq';
import { getRedisConnection } from '../utils/redis.js';

let campaignQueue = null;

export const getCampaignQueue = () => {
    if (!campaignQueue) {
        campaignQueue = new Queue('campaign-execution', {
            connection: getRedisConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        });
    }
    return campaignQueue;
};

export const enqueueCampaign = async (campaignId, origin) => {
    try {
        const queue = getCampaignQueue();
        await queue.add('run-campaign', { campaignId, origin });
        console.log(`[Queue] Campaign ${campaignId} enqueued for background execution.`);
        return true;
    } catch (err) {
        console.error(`[Queue] Failed to enqueue campaign ${campaignId}:`, err);
        return false;
    }
};

export const enqueueResend = async (campaignId) => {
    try {
        const queue = getCampaignQueue();
        await queue.add('resend-campaign', { campaignId });
        console.log(`[Queue] Campaign ${campaignId} enqueued for failed email resend.`);
        return true;
    } catch (err) {
        console.error(`[Queue] Failed to enqueue resend for campaign ${campaignId}:`, err);
        return false;
    }
};
