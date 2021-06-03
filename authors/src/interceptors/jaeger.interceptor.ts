import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import {
  initTracer,
  JaegerTracer,
  TracingConfig,
  TracingOptions,
} from 'jaeger-client';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Tags, FORMAT_HTTP_HEADERS } from 'opentracing';

const JAEGER_HOST = process.env.JAEGER_HOST || '127.0.0.1';
const tracer = initJaegerTracer('author');

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
export class JaegerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('used');
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, request.headers);
    const span = tracer.startSpan(request.url, {
      childOf: parentSpan,
    });

    span.addTags({
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER,
      [Tags.HTTP_METHOD]: request.method,
      [Tags.HTTP_URL]: request.path,
    });

    const finishSpan = () => {
      const response = ctx.getResponse<Response>();

      span.setTag(Tags.HTTP_STATUS_CODE, response.statusCode);
      span.finish();
    };
    return next.handle().pipe(
      catchError((err: unknown) => {
        span.setTag(Tags.ERROR, true);
        finishSpan();
        return throwError(err);
      }),
      tap(() => {
        finishSpan();
      }),
    );
  }
}
