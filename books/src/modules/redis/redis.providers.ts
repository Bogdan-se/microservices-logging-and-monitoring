import { createClient } from 'redis';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';
export const REDIS_TOPIC = 'frontend';
export const redisProviders = [
  {
    provide: REDIS_CONNECTION,
    useFactory: async () => {
      const redisInstance = createClient({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: 6379,
      });
      return redisInstance;
    },
  },
];
