import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PaginationService } from '../../common/pagination.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PaginationService],
  exports: [StudentsService],
})
export class StudentsModule {}
