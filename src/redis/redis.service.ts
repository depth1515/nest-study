import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }

  /**
   *
   * @param key 存储 key 值q
   * @param val key 对应的 val
   * @param seconds 可选，过期时间，单位 秒
   */
  async set(key: string, val: string, seconds?: number): Promise<'OK' | null> {
    if (!seconds) return await this.client.set(key, val);
    return await this.client.set(key, val, 'EX', seconds);
  }
}
