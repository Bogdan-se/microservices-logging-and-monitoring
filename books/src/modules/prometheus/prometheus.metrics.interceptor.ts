import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { PrometheusProvider } from './prometheus.provider';

@Injectable()
export class PrometheusMetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheusProvider: PrometheusProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response: Response = context.switchToHttp().getResponse();
        response.header('Content-Type', this.prometheusProvider.getHeader());
        return data;
      }),
    );
  }
}
