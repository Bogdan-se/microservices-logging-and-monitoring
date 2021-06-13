import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { PrometheusProvider } from './prometheus.provider';

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  constructor(private readonly prometheusProvider: PrometheusProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    const ControllerName = context.getClass().name;

    this.prometheusProvider.countRequest(ControllerName);

    const endExecutionDuration = this.prometheusProvider.startTimer(
      ControllerName,
      request.url,
    );

    return next.handle().pipe(
      tap(() => {
        endExecutionDuration();
      }),
      catchError((err) => {
        this.prometheusProvider.countError(ControllerName);
        endExecutionDuration();
        throw err;
      }),
    );
  }
}
