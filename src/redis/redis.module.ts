import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import {
  RedisModule as liaoliaoRedisModule,
  RedisModuleAsyncOptions,
} from '@liaoliaots/nestjs-redis';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static forRootAsync(
    options: RedisModuleAsyncOptions,
    isGlobal = true,
  ): DynamicModule {
    return {
      module: RedisModule,
      imports: [liaoliaoRedisModule.forRootAsync(options, isGlobal)],
      providers: [RedisService],
      exports: [RedisService],
    };
  }
}
