import { Injectable } from '@nestjs/common';
import {
  initTracer,
  JaegerTracer,
  TracingConfig,
  TracingOptions,
} from 'jaeger-client';
import { FORMAT_HTTP_HEADERS, Tags, Span } from 'opentracing';
import { IncomingHttpHeaders } from 'http';

import { Logger } from '../logger/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { HttpContextProvider } from '../http/http.context';

const JAEGER_HOST = process.env.JAEGER_HOST || '127.0.0.1';

const serviceName = 'author';

@Injectable()
export class JaegerProvider {
  public tracer: JaegerTracer;

  constructor(
    @Logger('JaegerProvider', process.env.SYSTEM_LOG_LEVEL)
    private readonly logger: LoggerService,
    private readonly httpContextProvider: HttpContextProvider,
  ) {
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
      logger: {
        info: (message: string) => this.logger.log(message),
        error: (message: string) => this.logger.error(message),
      },
    };

    this.tracer = initTracer(config, options);
  }

  extractHeader(span: Span): IncomingHttpHeaders {
    const traceHeaders = {};
    this.tracer.inject(span, FORMAT_HTTP_HEADERS, traceHeaders);
    return traceHeaders;
  }

  extractTraceId(span: Span): string {
    return span.context().toTraceId();
  }

  startSpan(
    method: string,
    url: string,
    path: string,
    headers: IncomingHttpHeaders,
  ): Span {
    const parentSpan = this.tracer.extract(FORMAT_HTTP_HEADERS, headers);

    const span = this.tracer.startSpan(url, {
      childOf: parentSpan,
    });

    span.addTags({
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER,
      [Tags.HTTP_METHOD]: method,
      [Tags.HTTP_URL]: path,
    });

    return span;
  }

  finishSpan(span: Span, statusCode: number, isError: boolean): void {
    if (isError) {
      span.setTag(Tags.ERROR, true);
    }
    span.setTag(Tags.HTTP_STATUS_CODE, statusCode);
    span.finish();
  }

  addChildSpan(name: string): void {
    const headers = this.httpContextProvider.getHeaders();
    const parentSpan = this.tracer.extract(FORMAT_HTTP_HEADERS, headers);

    const span = this.tracer.startSpan(name, {
      childOf: parentSpan,
    });

    span.finish();
  }
}
