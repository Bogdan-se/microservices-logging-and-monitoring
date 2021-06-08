import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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

@Module({
  imports: [
    ApiModule,
    RedisModule,
    BooksModule,
    LoggerModule.forRoot(),
    JaegerModule,
    HttpModule,
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
