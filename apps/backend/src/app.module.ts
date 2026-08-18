import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { LecturersModule } from './modules/lecturers/lecturers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { MasterModule } from './modules/master/master.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { KrsModule } from './modules/krs/krs.module';
import { GradesModule } from './modules/grades/grades.module';
import { KhsModule } from './modules/khs/khs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PaginationService } from './common/pagination.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    LecturersModule,
    CoursesModule,
    MasterModule,
    AcademicYearsModule,
    SchedulesModule,
    KrsModule,
    GradesModule,
    KhsModule,
    DashboardModule,
    SettingsModule,
  ],
  providers: [PaginationService],
})
export class AppModule {}
