import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import axios from 'axios';

import { ApiModule } from './modules/api/api.module';
import { BooksModule } from './modules/books/books.module';
import { HttpModule } from './modules/http/http.module';
import { HttpMiddleware } from './modules/http/http.middleware';
import { HttpContextProvider } from './modules/http/http.context';
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
    ApiModule,
    RedisModule,
    BooksModule,
    LoggerModule.forRoot(),
    JaegerModule,
    HttpModule,
    PrometheusModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly httpContextProvider: HttpContextProvider) {}
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(JaegerMiddleware).forRoutes('*');
  }

  onModuleInit() {
    axios.interceptors.request.use((config) => {
      config.headers = {
        ...config.headers,
        ...this.httpContextProvider.getHeaders(),
      };

      return config;
    });
  }
}
