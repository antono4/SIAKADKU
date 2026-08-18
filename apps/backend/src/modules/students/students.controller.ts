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
import { StudentsService } from './students.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  createStudentSchema,
  studentQuerySchema,
  updateStudentSchema,
} from './students.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  @UsePipes(new ZodValidationPipe(studentQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.students.findMany(query as never);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  stats() {
    return this.students.stats();
  }

  @Get('by-npm/:npm')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  findByNpm(@Param('npm') npm: string) {
    return this.students.findByNpm(npm);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.students.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createStudentSchema))
  create(@Body() dto: unknown) {
    return this.students.create(dto as never);
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(200)
  importMany(@Body() body: { rows: unknown[] }) {
    return this.students.importMany((body.rows ?? []) as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(updateStudentSchema))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: unknown) {
    return this.students.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.students.remove(id);
  }
}
