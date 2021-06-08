import { Module } from '@nestjs/common';

import { HttpModule } from '../http/http.module';
import { JaegerProvider } from './jaeger.provider';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule.forRoot(), HttpModule],
  providers: [JaegerProvider],
  exports: [JaegerProvider],
})
export class JaegerModule {}
