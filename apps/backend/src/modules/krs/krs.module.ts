import { Module } from '@nestjs/common';
import { KrsService } from './krs.service';
import { KrsController } from './krs.controller';

@Module({
  controllers: [KrsController],
  providers: [KrsService],
  exports: [KrsService],
})
export class KrsModule {}
