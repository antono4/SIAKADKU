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
import { SchedulesService } from './schedules.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { createScheduleSchema, scheduleQuerySchema, updateScheduleSchema } from './schedules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(scheduleQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.schedules.findMany(query as never);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedules.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createScheduleSchema))
  create(@Body() dto: unknown) {
    return this.schedules.create(dto as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(updateScheduleSchema))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: unknown) {
    return this.schedules.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.schedules.remove(id);
  }
}
