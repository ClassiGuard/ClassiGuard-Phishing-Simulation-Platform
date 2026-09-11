import Redis from 'ioredis';

// Create a single Redis connection to be reused
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

let redisConnection = null;

export const getRedisConnection = () => {
    if (!redisConnection) {
        redisConnection = new Redis({
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        redisConnection.on('error', (err) => {
            console.error('[Redis] Connection error:', err);
        });
        redisConnection.on('connect', () => {
            console.log(`[Redis] Connected to ${redisHost}:${redisPort}`);
        });
    }
    return redisConnection;
};
