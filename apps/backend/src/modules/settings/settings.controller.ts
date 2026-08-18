import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  findAll() {
    return this.settings.findAll();
  }

  @Patch()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  bulkUpsert(@Body() body: Record<string, string>) {
    return this.settings.bulkUpsert(body);
  }
}
