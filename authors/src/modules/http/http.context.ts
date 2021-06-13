import { Injectable } from '@nestjs/common';

import * as httpContext from 'express-http-context';

@Injectable()
export class HttpContextProvider {
  private HEADER = 'TRACE_HEADERS';
  private TRACE_ID = 'TRACE_ID';
  public getHeaders() {
    return httpContext.get(this.HEADER);
  }
  public setHeaders(headers) {
    httpContext.set(this.HEADER, headers);
  }
  public getTraceId() {
    return httpContext.get(this.TRACE_ID);
  }
  public setTraceId(headers) {
    httpContext.set(this.TRACE_ID, headers);
  }
}
