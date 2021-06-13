import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AuthorsModule } from './modules/authors/authors.module';
import { HttpModule } from './modules/http/http.module';
import { HttpMiddleware } from './modules/http/http.middleware';
import { JaegerModule } from './modules/jaeger/jaeger.module';
import { JaegerMiddleware } from './modules/jaeger/jaeger.middleware';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    AuthorsModule,
    LoggerModule.forRoot(),
    JaegerModule,
    HttpModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(JaegerMiddleware).forRoutes('*');
  }
}
