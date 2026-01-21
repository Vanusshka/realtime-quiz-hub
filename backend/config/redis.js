const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
};

module.exports = { connectRedis, redisClient };
