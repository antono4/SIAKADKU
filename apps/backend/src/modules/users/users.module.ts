import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PaginationService } from '../../common/pagination.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PaginationService],
  exports: [UsersService],
})
export class UsersModule {}
