import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis | null;

  constructor(private configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      });
    } else {
      this.redis = null;
    }
  }

  isInitialized(): boolean {
    return this.redis !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis) return;
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }

  // เพิ่มสำหรับ Hash
  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.redis) return {};
    return this.redis.hgetall(key);
  }

  // เพิ่มสำหรับ Keys
  async keys(pattern: string): Promise<string[]> {
    if (!this.redis) return [];
    return this.redis.keys(pattern);
  }

  // เข้าถึง client (ถ้าต้องการ)
  getClient(): Redis | null {
    return this.redis;
  }
}
