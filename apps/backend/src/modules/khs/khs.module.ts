import { Module } from '@nestjs/common';
import { KhsService } from './khs.service';
import { KhsController } from './khs.controller';

@Module({
  controllers: [KhsController],
  providers: [KhsService],
  exports: [KhsService],
})
export class KhsModule {}
