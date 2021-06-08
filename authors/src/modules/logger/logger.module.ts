import { DynamicModule } from '@nestjs/common';

import { HttpModule } from '../http/http.module';
import { LoggerService } from './logger.service';
import { createLoggerProviders } from './logger.provider';

export class LoggerModule {
  static forRoot(): DynamicModule {
    const prefixedLoggerProviders = createLoggerProviders();

    return {
      module: LoggerModule,
      imports: [HttpModule],
      providers: [LoggerService, ...prefixedLoggerProviders],
      exports: [LoggerService, ...prefixedLoggerProviders],
    };
  }
}
