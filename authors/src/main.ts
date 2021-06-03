import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { JaegerInterceptor } from './interceptors/jaeger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new JaegerInterceptor());
  await app.listen(8081);
}
bootstrap();
