import { Provider } from '@nestjs/common';

import { HttpContextProvider } from '../http/http.context';
import { loggers } from './logger.decorator';
import { LoggerService } from './logger.service';

function createLoggerProvider(
  prefix: string,
  logLevel: string,
): Provider<LoggerService> {
  return {
    provide: `LoggerService${prefix}`,
    useFactory: (httpContextProvider: HttpContextProvider) => {
      return new LoggerService(prefix, logLevel, httpContextProvider);
    },
    inject: [HttpContextProvider],
  };
}

export function createLoggerProviders(): Array<Provider<LoggerService>> {
  const loggerProviders = [];
  for (const logger of loggers.values()) {
    const { prefix, logLevel } = logger;
    loggerProviders.push(createLoggerProvider(prefix, logLevel));
  }
  return loggerProviders;
}
