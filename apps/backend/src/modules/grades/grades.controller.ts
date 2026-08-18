import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  bulkUpsertGradeSchema,
  gradeQuerySchema,
  publishGradesSchema,
  upsertGradeSchema,
} from './grades.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly grades: GradesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  @UsePipes(new ZodValidationPipe(gradeQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.grades.findMany(query as never);
  }

  @Get('entry')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  forEntry(@Query('academicYearId') ay: string, @Query('courseId') course: string) {
    if (!ay || !course) return [];
    return this.grades.forEntry(Number(ay), Number(course));
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN, UserRole.MAHASISWA)
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.grades.findByStudent(studentId, academicYearId ? Number(academicYearId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grades.findOne(id);
  }

  @Post()
  @Roles(UserRole.DOSEN, UserRole.AKADEMIK, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(upsertGradeSchema))
  upsert(@Body() dto: unknown) {
    return this.grades.upsert(dto as never);
  }

  @Post('bulk')
  @Roles(UserRole.DOSEN, UserRole.AKADEMIK, UserRole.ADMIN)
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(bulkUpsertGradeSchema))
  bulkUpsert(@Body() dto: unknown) {
    return this.grades.bulkUpsert(dto as never);
  }

  @Patch('publish')
  @Roles(UserRole.AKADEMIK, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(publishGradesSchema))
  publish(@Body() dto: { studyPointIds: number[] }) {
    return this.grades.publish(dto.studyPointIds);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.grades.remove(id);
  }
}
