import { Controller, Get } from '@nestjs/common';

import { ApiClient, ApiResponse } from '../api/api.interface';
import { ApiService } from '../api/api.service';
import { AuthorDto, BookDto, BooksAndAuthorsDto } from './frontend.dto';
import { Logger } from '../logger/logger.decorator';
import { LoggerService } from '../logger/logger.service';

@Controller('api/v1/details')
export class FrontendController {
  private readonly authorsApi: ApiClient;
  private readonly booksApi: ApiClient;

  constructor(
    apiService: ApiService,
    @Logger('BooksController', process.env.CONTROLLER_LOG_LEVEL)
    private readonly logger: LoggerService,
  ) {
    this.authorsApi = apiService.getAuthorsApi();
    this.booksApi = apiService.getBooksApi();
  }

  @Get('/')
  async getBooksAndAuthors(): Promise<BooksAndAuthorsDto> {
    this.logger.log('Get books and authors');
    const { data: authors }: ApiResponse<AuthorDto[]> =
      await this.authorsApi.get('/');

    const { data: books }: ApiResponse<BookDto[]> = await this.booksApi.get(
      '/',
    );
    return { authors, books };
  }
}
