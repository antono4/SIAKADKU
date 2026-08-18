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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Master - Concentrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('concentrations')
export class ConcentrationsController {
  constructor(private readonly master: MasterService) {}

  @Get()
  findMany() {
    return this.master.findConcentrations();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  create(@Body() data: { code: string; name: string; description?: string }) {
    return this.master.createConcentration(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: { code?: string; name?: string; description?: string }) {
    return this.master.updateConcentration(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.master.removeConcentration(id);
  }
}

@ApiTags('Master - Classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly master: MasterService) {}

  @Get()
  findMany() {
    return this.master.findClassrooms();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  create(@Body() data: { code: string; name: string; capacity?: number; building?: string }) {
    return this.master.createClassroom(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { code?: string; name?: string; capacity?: number; building?: string },
  ) {
    return this.master.updateClassroom(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.master.removeClassroom(id);
  }
}
