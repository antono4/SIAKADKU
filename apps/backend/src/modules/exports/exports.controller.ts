import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exports')
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Get('krs/:studentId/pdf')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN, UserRole.MAHASISWA)
  krsPdf(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId', ParseIntPipe) academicYearId: number,
    @Res() res: Response,
  ) {
    return this.exports.krsPdf(studentId, academicYearId, res);
  }

  @Get('khs/:studentId/pdf')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN, UserRole.MAHASISWA)
  khsPdf(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId', ParseIntPipe) academicYearId: number,
    @Res() res: Response,
  ) {
    return this.exports.khsPdf(studentId, academicYearId, res);
  }

  @Get('transcript/:studentId/pdf')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.MAHASISWA)
  transcriptPdf(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Res() res: Response,
  ) {
    return this.exports.transcriptPdf(studentId, res);
  }

  @Get('students/csv')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  studentsCsv(@Res() res: Response) {
    return this.exports.studentsCsv(res);
  }

  @Get('grades/csv')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  gradesCsv(
    @Query('academicYearId', ParseIntPipe) academicYearId: number,
    @Res() res: Response,
  ) {
    return this.exports.gradesCsv(academicYearId, res);
  }
}
