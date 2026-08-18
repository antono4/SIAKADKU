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
import { LecturersService } from './lecturers.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  createLecturerSchema,
  lecturerQuerySchema,
  updateLecturerSchema,
} from './lecturers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Lecturers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  @UsePipes(new ZodValidationPipe(lecturerQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.lecturers.findMany(query as never);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lecturers.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createLecturerSchema))
  create(@Body() dto: unknown) {
    return this.lecturers.create(dto as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(updateLecturerSchema))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: unknown) {
    return this.lecturers.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.lecturers.remove(id);
  }
}
