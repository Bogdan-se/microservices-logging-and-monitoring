import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuthorsModule } from './modules/authors/authors.module';
import { HttpModule } from './modules/http/http.module';
import { HttpMiddleware } from './modules/http/http.middleware';
import { JaegerModule } from './modules/jaeger/jaeger.module';
import { JaegerMiddleware } from './modules/jaeger/jaeger.middleware';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { RedisModule } from './modules/redis/redis.module';
import { PrometheusModule } from './modules/prometheus/prometheus.module';
import { PrometheusInterceptor } from './modules/prometheus/prometheus.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
  ],
  imports: [
    RedisModule,
    AuthorsModule,
    LoggerModule.forRoot(),
    JaegerModule,
    HttpModule,
    PrometheusModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(JaegerMiddleware).forRoutes('*');
  }
}
