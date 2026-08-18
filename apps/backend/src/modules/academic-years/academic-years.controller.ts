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
import { AcademicYearsService } from './academic-years.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  academicYearQuerySchema,
  createAcademicYearSchema,
  updateAcademicYearSchema,
} from './academic-years.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Academic Years')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYears: AcademicYearsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(academicYearQuerySchema))
  findMany(@Query() query: { active?: string }) {
    return this.academicYears.findMany(query);
  }

  @Get('active')
  findActive() {
    return this.academicYears.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicYears.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createAcademicYearSchema))
  create(@Body() dto: unknown) {
    return this.academicYears.create(dto as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(updateAcademicYearSchema))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: unknown) {
    return this.academicYears.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.academicYears.remove(id);
  }
}
