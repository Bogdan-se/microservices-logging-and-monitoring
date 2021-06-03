import { Injectable, NestMiddleware } from '@nestjs/common';
import {
  initTracer,
  JaegerTracer,
  TracingConfig,
  TracingOptions,
} from 'jaeger-client';
import { Request, Response, NextFunction } from 'express';
import { Tags, FORMAT_HTTP_HEADERS } from 'opentracing';
import * as httpContext from 'express-http-context';

const JAEGER_HOST = process.env.JAEGER_HOST || '127.0.0.1';
export const tracer = initJaegerTracer('frontend');

function initJaegerTracer(serviceName: string): JaegerTracer {
  const config: TracingConfig = {
    serviceName,
    sampler: {
      param: 1,
      type: 'const',
    },
    reporter: {
      collectorEndpoint: `http://${JAEGER_HOST}:14268/api/traces`,
      logSpans: true,
    },
  };
  const options: TracingOptions = {
    logger: console,
  };

  return initTracer(config, options);
}

@Injectable()
export class TraceContextProvider {
  private headers: 'HEADERS';
  public getHeaders() {
    return httpContext.get(this.headers);
  }
  public setHeaders(headers) {
    return httpContext.set(this.headers, headers);
  }
}

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  constructor(private traceContextProvider: TraceContextProvider) {}

  use(req: Request, res: Response, next: NextFunction) {
    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const span = tracer.startSpan(req.baseUrl, {
      childOf: parentSpan,
    });

    span.addTags({
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER,
      [Tags.HTTP_METHOD]: req.method,
      [Tags.HTTP_URL]: req.path,
    });

    const finishSpan = () => {
      if (res.statusCode >= 500) {
        span.setTag(Tags.ERROR, true);
      }
      span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);
      span.finish();
    };
    res.on('finish', finishSpan);

    httpContext.middleware(req, res, () => {
      const headers = {};
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      this.traceContextProvider.setHeaders(headers);

      return next();
    });
  }
}
