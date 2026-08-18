import { Module } from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { LecturersController } from './lecturers.controller';
import { PaginationService } from '../../common/pagination.service';

@Module({
  controllers: [LecturersController],
  providers: [LecturersService, PaginationService],
  exports: [LecturersService],
})
export class LecturersModule {}
