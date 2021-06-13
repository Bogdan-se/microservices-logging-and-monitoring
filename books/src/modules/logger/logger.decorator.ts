import { Inject } from '@nestjs/common';

export const loggers = new Map();

export function Logger(prefix = '', logLevel = 'info') {
  if (!loggers.has(prefix)) {
    loggers.set(prefix, {
      prefix,
      logLevel,
    });
  }
  return Inject(`LoggerService${prefix}`);
}
