import { LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

import { HttpContextProvider } from '../http/http.context';

const ELASTIC_HOST = process.env.ELASTIC_HOST || '127.0.0.1';
const LOG_FILE = process.env.LOG_FILE || 'logs/books.log';

export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(
    prefix = '',
    logLevel = 'info',
    httpContextProvider: HttpContextProvider,
  ) {
    const addTraceId = winston.format((info) => {
      info.traceId = httpContextProvider.getTraceId();
      return info;
    });

    const esTransport = new ElasticsearchTransport({
      level: logLevel,
      clientOpts: { node: `http://${ELASTIC_HOST}:9200` },
    });

    this.logger = winston.createLogger({
      level: logLevel,
      defaultMeta: { service: 'books', prefix },
      format: winston.format.combine(addTraceId(), winston.format.json()),
      transports: [
        new winston.transports.File({
          filename: LOG_FILE,
        }),
        esTransport,
      ],
    });

    this.logger.on('error', (error) => {
      console.error('Error caught', error);
    });
    esTransport.on('warning', (error) => {
      console.error('Error caught', error);
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            addTraceId(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  public log(message: string) {
    this.logger.info(message);
  }
  public error(message: string, trace = '') {
    this.logger.error(message, trace);
  }
  public warn(message: string) {
    this.logger.warning(message);
  }
  public debug(message: string) {
    this.logger.debug(message);
  }
  public verbose(message: string) {
    this.logger.verbose(message);
  }
}
