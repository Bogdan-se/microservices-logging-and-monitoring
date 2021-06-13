import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { Logger } from './logger.decorator';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Logger('LoggerMiddleware', process.env.SYSTEM_LOG_LEVEL)
    private readonly logger: LoggerService,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, path, baseUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      const executionTime = Date.now() - start;

      this.logger.debug(
        JSON.stringify({
          method,
          path,
          baseUrl,
          statusCode,
          contentLength,
          userAgent,
          ip,
          executionTime,
        }),
      );
    });

    next();
  }
}
