import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PaginationService } from '../../common/pagination.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PaginationService],
  exports: [CoursesService],
})
export class CoursesModule {}
