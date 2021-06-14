import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { PrometheusProvider } from './prometheus.provider';
import { PrometheusMetricsInterceptor } from './prometheus.metrics.interceptor';

@UseInterceptors(PrometheusMetricsInterceptor)
@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusProvider: PrometheusProvider) {}

  @Get('/')
  getMetrics() {
    return this.prometheusProvider.getMetrics();
  }
}
