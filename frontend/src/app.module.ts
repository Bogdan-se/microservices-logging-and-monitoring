import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { FrontendModule } from './modules/frontend/frontend.module';
import { ApiModule } from './modules/api/api.module';
import { TraceContextProvider, TracingMiddleware } from './common/tracer';

@Module({
  imports: [ApiModule, FrontendModule],
  providers: [TraceContextProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
