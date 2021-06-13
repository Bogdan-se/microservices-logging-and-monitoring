import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { LoggerModule } from '../logger/logger.module';

import { FrontendController } from './frontend.controller';

@Module({
  imports: [LoggerModule.forRoot(), ApiModule],
  controllers: [FrontendController],
})
export class FrontendModule {}
