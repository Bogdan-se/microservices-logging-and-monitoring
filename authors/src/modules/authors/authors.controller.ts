import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { RedisClient } from 'redis';

import { JaegerProvider } from '../jaeger/jaeger.provider';
import { Logger } from '../logger/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { REDIS_CONNECTION, REDIS_TOPIC } from '../redis/redis.providers';

import { AuthorsService } from './authors.service';
import { AuthorDto, CreateAuthorInput } from './authors.dto';

@Controller('api/v1/authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    @Inject(REDIS_CONNECTION)
    private readonly redisInstance: RedisClient,
    @Logger('AuthorsController', process.env.CONTROLLER_LOG_LEVEL)
    private readonly logger: LoggerService,
    private readonly jaegerProvider: JaegerProvider,
  ) {}

  @Get('/')
  getAuthors(): AuthorDto[] {
    this.logger.log('Get authors');
    return this.authorsService.getAuthors();
  }

  @Get('/:id')
  getAuthorById(@Param('id') id: string): AuthorDto {
    this.logger.log('Get author by ID');
    return this.authorsService.findById(id);
  }

  @Post('/')
  createAuthor(@Body() data: CreateAuthorInput): AuthorDto {
    this.logger.log('Create author');
    const author = this.authorsService.create(data);
    this.sendPushNotification(author);
    return author;
  }

  private sendPushNotification(response: AuthorDto): void {
    this.logger.log('Send push notification');
    this.jaegerProvider.addChildSpan('Send push notification');
    this.redisInstance.set(REDIS_TOPIC, JSON.stringify(response));
  }
}
