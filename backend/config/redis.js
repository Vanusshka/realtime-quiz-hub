const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    // Railway auto-generates REDIS_URL when you add Redis service
    if (!process.env.REDIS_URL) {
      console.log('⚠️  REDIS_URL not found. Skipping Redis connection.');
      console.log('💡 To add Redis: Railway dashboard → New → Database → Add Redis');
      console.log('⚠️  App will run without caching (this is fine).');
      return null;
    }

    console.log('🔄 Connecting to Railway Redis...');

    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.log('❌ Redis: Too many reconnection attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 1000, 5000); // Max 5 second delay
        },
        connectTimeout: 15000, // 15 second timeout for Railway
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Railway Redis Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Railway Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Railway Redis: Connected and ready');
    });

    // Set a timeout for connection
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Railway Redis connection timeout')), 20000);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    return redisClient;
  } catch (error) {
    console.error('❌ Railway Redis connection failed:', error.message);
    console.log('⚠️  App will continue without Redis caching (this is fine)');
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
