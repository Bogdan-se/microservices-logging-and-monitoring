import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { HttpContextProvider } from '../http/http.context';
import { JaegerProvider } from './jaeger.provider';

@Injectable()
export class JaegerMiddleware implements NestMiddleware {
  constructor(
    private readonly jaegerProvider: JaegerProvider,
    private readonly httpContextProvider: HttpContextProvider,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { headers, method, path, url } = req;
    const span = this.jaegerProvider.startSpan(method, url, path, headers);

    const finishSpan = () => {
      const isError = res.statusCode >= 500;
      this.jaegerProvider.finishSpan(span, res.statusCode, isError);
    };
    res.on('finish', finishSpan);

    const traceHeaders = this.jaegerProvider.extractHeader(span);
    this.httpContextProvider.setHeaders(traceHeaders);

    const traceId = this.jaegerProvider.extractTraceId(span);
    this.httpContextProvider.setTraceId(traceId);

    next();
  }
}
