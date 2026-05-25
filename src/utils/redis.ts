/**
 * Redis client and caching utilities
 * Supports: string, JSON, TTL-based caching with pattern invalidation
 */

import { createClient, RedisClientType } from 'redis';
import logger from './logger';

let redisClient: RedisClientType | null = null;

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const CACHE_TTL = 300; // 5 minutes default

/**
 * Get or create Redis client singleton
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => logger.error({ err, type: 'redis_error' }));
    redisClient.on('connect', () => logger.info('Redis connected'));
  }
  return redisClient;
};

/**
 * Connect to Redis — call once at startup
 */
export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
};

/**
 * Disconnect Redis — call on graceful shutdown
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    logger.info('Redis disconnected');
  }
};

// ================================
// Cache helpers
// ================================

/**
 * Get cached value, or execute fn and cache the result
 */
export const cacheOrFetch = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL
): Promise<T> => {
  const client = getRedisClient();

  try {
    const cached = await client.get(key);
    if (cached !== null) {
      logger.debug({ key, type: 'cache_hit' });
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key, type: 'cache_read_error' });
  }

  const data = await fn();
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
    logger.debug({ key, type: 'cache_set' });
  } catch (err) {
    logger.warn({ err, key, type: 'cache_write_error' });
  }

  return data;
};

/**
 * Invalidate cache keys matching a pattern
 * Usage: await invalidatePattern('user:profile:*')
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  const client = getRedisClient();

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug({ pattern, count: keys.length, type: 'cache_invalidate' });
    }
  } catch (err) {
    logger.warn({ err, pattern, type: 'cache_invalidate_error' });
  }
};

/**
 * Delete specific cache key(s)
 */
export const invalidateKey = async (...keys: string[]): Promise<void> => {
  const client = getRedisClient();
  if (keys.length > 0) {
    await client.del(keys);
    logger.debug({ keys, type: 'cache_delete' });
  }
};

/**
 * Set a cache key with custom TTL
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = CACHE_TTL
): Promise<void> => {
  const client = getRedisClient();
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
};

/**
 * Get a cache key — returns null if not found or expired
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  const cached = await client.get(key);
  return cached ? (JSON.parse(cached) as T) : null;
};

// ================================
// Key generators (consistency helper)
// ================================

export const CacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,
  userPreferences: (userId: string) => `user:preferences:${userId}`,
  staticData: (type: string) => `static:${type}`,
  lookupTable: (table: string, id: number) => `lookup:${table}:${id}`,
  searchResults: (hash: string) => `search:${hash}`,
};
