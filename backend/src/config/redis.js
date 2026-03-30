const Redis = require('ioredis');

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

if (redis) {
  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));
} else {
  console.warn('REDIS_URL not set. Redis features will be disabled.');
}

module.exports = redis;
