import { Module } from '@nestjs/common';

import { PrometheusController } from './prometheus.controller';
import { PrometheusProvider } from './prometheus.provider';

@Module({
  providers: [PrometheusProvider],
  controllers: [PrometheusController],
  exports: [PrometheusProvider],
})
export class PrometheusModule {}
