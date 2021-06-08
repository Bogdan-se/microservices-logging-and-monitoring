import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { JaegerModule } from '../jaeger/jaeger.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/redis.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [LoggerModule.forRoot(), ApiModule, JaegerModule, RedisModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
