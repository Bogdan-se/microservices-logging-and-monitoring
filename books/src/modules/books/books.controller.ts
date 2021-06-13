import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { RedisClient } from 'redis';

import { JaegerProvider } from '../jaeger/jaeger.provider';
import { Logger } from '../logger/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { REDIS_CONNECTION, REDIS_TOPIC } from '../redis/redis.providers';

import { BookDto, CreateBookInput } from './books.dto';
import { BooksService } from './books.service';

@Controller('api/v1/books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    @Inject(REDIS_CONNECTION)
    private readonly redisInstance: RedisClient,
    @Logger('BooksController', process.env.CONTROLLER_LOG_LEVEL)
    private readonly logger: LoggerService,
    private readonly jaegerProvider: JaegerProvider,
  ) {}

  @Get('/')
  getBooks(): BookDto[] {
    this.logger.log('Get books');
    return this.booksService.getBooks();
  }

  @Get('/:id')
  getBookById(@Param('id') id: string): BookDto {
    this.logger.log('Get a book by ID');
    return this.booksService.findById(id);
  }

  @Post('/')
  async createBook(@Body() data: CreateBookInput): Promise<BookDto> {
    this.logger.log('Create a book');
    const book = await this.booksService.create(data);
    this.sendPushNotification(book);
    return book;
  }

  private sendPushNotification(response: BookDto): void {
    this.logger.log('Send push notification');
    this.jaegerProvider.addChildSpan('Send push notification');
    this.redisInstance.set(REDIS_TOPIC, JSON.stringify(response));
  }
}
