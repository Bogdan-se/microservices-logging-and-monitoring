import { Module } from '@nestjs/common';

import { HttpContextProvider } from './http.context';

@Module({
  providers: [HttpContextProvider],
  exports: [HttpContextProvider],
})
export class HttpModule {}
