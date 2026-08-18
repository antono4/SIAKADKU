import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KhsService } from './khs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('KHS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('khs')
export class KhsController {
  constructor(private readonly khs: KhsService) {}

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN, UserRole.MAHASISWA)
  generate(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId', ParseIntPipe) academicYearId: number,
  ) {
    return this.khs.generate(studentId, academicYearId);
  }

  @Get('transcript/:studentId')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.MAHASISWA)
  transcript(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.khs.transcript(studentId);
  }
}
