import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiClient } from './api.interface';
import { TraceContextProvider } from '../../common/tracer';

@Injectable()
export class ApiService {
  private readonly authorsApi: ApiClient;
  private readonly booksApi: ApiClient;

  constructor(private traceContextProvider: TraceContextProvider) {
    const authorsHost = process.env.AUTHORS_HOST || '127.0.0.1';
    const authorsPort = process.env.AUTHORS_PORT || 8081;
    this.authorsApi = this.createApiClient(
      `http://${authorsHost}:${authorsPort}/api/v1/authors`,
    );

    const booksHost = process.env.BOOKS_HOST || '127.0.0.1';
    const booksPort = process.env.BOOKS_PORT || 8082;
    this.booksApi = this.createApiClient(
      `http://${booksHost}:${booksPort}/api/v1/books`,
    );
  }

  public getAuthorsApi(): ApiClient {
    return this.authorsApi;
  }

  public getBooksApi(): ApiClient {
    return this.booksApi;
  }

  private addHeaders(config: AxiosRequestConfig & { public: boolean }) {
    const traceHeaders = this.traceContextProvider.getHeaders();
    const headers = config?.headers || {};

    return {
      ...config,
      headers: {
        ...headers,
        ...traceHeaders,
      },
    };
  }

  private createApiClient(baseURL = ''): ApiClient {
    return {
      get: (
        url,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.get(url, { ...this.addHeaders(config), baseURL }),
      post: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.post(url, data, { ...this.addHeaders(config), baseURL }),
      patch: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.patch(url, data, { ...this.addHeaders(config), baseURL }),
      put: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.put(url, data, { ...this.addHeaders(config), baseURL }),
      delete: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.delete(url, { ...this.addHeaders(config), baseURL, data }),
    };
  }
}
