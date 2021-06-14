import { Injectable } from '@nestjs/common';
import {
  register,
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
} from 'prom-client';

const ServiceName = 'authors';

@Injectable()
export class PrometheusProvider {
  private readonly registry: Registry;
  private requestCounter: Counter<any>;
  private errorCounter: Counter<any>;
  private executionDuration: Histogram<any>;
  constructor() {
    this.registry = new Registry();

    register.setDefaultLabels({ ServiceName });

    collectDefaultMetrics({ register: this.registry });

    this.requestCounter = new Counter({
      name: 'request_count',
      help: 'request_count',
      labelNames: ['ControllerName', 'ServiceName'],
      registers: [this.registry],
    });

    this.errorCounter = new Counter({
      name: 'error_count',
      help: 'error_count',
      labelNames: ['ControllerName', 'ServiceName'],
      registers: [this.registry],
    });

    this.executionDuration = new Histogram({
      name: 'execution_duration',
      help: 'execution_duration',
      labelNames: ['ControllerName', 'ServiceName', 'url'],
      registers: [this.registry],
    });
  }

  countRequest(ControllerName: string): void {
    this.requestCounter.inc({ ControllerName });
  }

  countError(ControllerName: string): void {
    this.errorCounter.inc({ ControllerName });
  }

  startTimer(ControllerName: string, url: string) {
    return this.executionDuration.startTimer({
      ControllerName,
      url: url,
    });
  }

  getHeader() {
    return this.registry.contentType;
  }

  getMetrics() {
    return this.registry.metrics();
  }
}
