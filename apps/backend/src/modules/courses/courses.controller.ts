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
import { CoursesService } from './courses.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { createCourseSchema, courseQuerySchema, updateCourseSchema } from './courses.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(courseQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.courses.findMany(query as never);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courses.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createCourseSchema))
  create(@Body() dto: unknown) {
    return this.courses.create(dto as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(updateCourseSchema))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: unknown) {
    return this.courses.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.courses.remove(id);
  }
}
