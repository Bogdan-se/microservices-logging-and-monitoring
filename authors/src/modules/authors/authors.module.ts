import { Module } from '@nestjs/common';

import { JaegerModule } from '../jaeger/jaeger.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/redis.module';

import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [LoggerModule.forRoot(), JaegerModule, RedisModule],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
