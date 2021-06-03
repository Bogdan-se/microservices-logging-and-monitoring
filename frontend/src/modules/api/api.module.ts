import { Module } from '@nestjs/common';

import { ApiService } from './api.service';
import { TraceContextProvider } from '../../common/tracer';

@Module({
  providers: [ApiService, TraceContextProvider],
  exports: [ApiService],
})
export class ApiModule {}
