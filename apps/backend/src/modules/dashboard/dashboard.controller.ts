import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  overview() {
    return this.dashboard.overview();
  }

  @Get('lecturer')
  @Roles(UserRole.DOSEN, UserRole.ADMIN, UserRole.AKADEMIK)
  lecturerOverview(@CurrentUser() user: { lecturerId?: number | null }) {
    return this.dashboard.lecturerOverview(user.lecturerId ?? 0);
  }

  @Get('student')
  @Roles(UserRole.MAHASISWA, UserRole.ADMIN, UserRole.AKADEMIK)
  studentOverview(
    @CurrentUser() user: { studentId?: number | null },
    @Query('academicYearId') ay?: string,
  ) {
    return this.dashboard.studentOverview(user.studentId ?? 0, ay ? Number(ay) : undefined);
  }
}
