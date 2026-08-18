import { Module } from '@nestjs/common';
import { ConcentrationsController, ClassroomsController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  controllers: [ConcentrationsController, ClassroomsController],
  providers: [MasterService],
  exports: [MasterService],
})
export class MasterModule {}
