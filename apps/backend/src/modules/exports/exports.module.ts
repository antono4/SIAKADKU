import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { KhsModule } from '../khs/khs.module';

@Module({
  imports: [KhsModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
