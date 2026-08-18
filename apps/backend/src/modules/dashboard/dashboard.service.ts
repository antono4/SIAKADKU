import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      totalStudents,
      activeStudents,
      nonactiveStudents,
      graduatedStudents,
      totalCourses,
      totalLecturers,
      totalSchedules,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.student.count({ where: { status: 'nonactive' } }),
      this.prisma.student.count({ where: { status: 'graduated' } }),
      this.prisma.course.count({ where: { active: true } }),
      this.prisma.lecturer.count({ where: { status: 'active' } }),
      this.prisma.schedule.count(),
    ]);

    const byYear = await this.prisma.student.groupBy({
      by: ['registerYear', 'entryStatus'],
      _count: { _all: true },
      orderBy: { registerYear: 'asc' },
    });

    const studentsByYear: Record<
      string,
      { reguler: number; pindahan: number }
    > = {};
    for (const row of byYear) {
      const year = row.registerYear ?? '—';
      const bucket = (studentsByYear[year] ??= { reguler: 0, pindahan: 0 });
      if (row.entryStatus === 'pindahan') bucket.pindahan += row._count._all;
      else bucket.reguler += row._count._all;
    }

    return {
      counts: {
        totalStudents,
        activeStudents,
        nonactiveStudents,
        graduatedStudents,
        totalCourses,
        totalLecturers,
        totalSchedules,
      },
      studentsByYear: Object.entries(studentsByYear).map(([year, v]) => ({
        year,
        reguler: v.reguler,
        pindahan: v.pindahan,
      })),
    };
  }

  async lecturerOverview(lecturerId: number) {
    const [schedules, courses, studentsSupervised] = await Promise.all([
      this.prisma.schedule.count({ where: { lecturerId } }),
      this.prisma.schedule.findMany({
        where: { lecturerId },
        include: { course: true, academicYear: true },
        take: 5,
        orderBy: { id: 'desc' },
      }),
      this.prisma.plainStudy.count({
        where: { schedule: { lecturerId } },
      }),
    ]);

    return {
      counts: { schedules, courses: courses.length, studentsSupervised },
      recentCourses: courses,
    };
  }

  async studentOverview(studentId: number, academicYearId?: number) {
    const activeYear =
      academicYearId != null
        ? await this.prisma.academicYear.findUnique({ where: { id: academicYearId } })
        : await this.prisma.academicYear.findFirst({ where: { active: true } });

    const [krsRows, publishedGrades] = await Promise.all([
      this.prisma.plainStudy.findMany({
        where: { studentId, academicYearId: activeYear?.id },
        select: { course: { select: { sks: true } } },
      }),
      this.prisma.studyPoint.count({
        where: { studentId, published: true },
      }),
    ]);

    const totalSks = krsRows.reduce((sum, r) => sum + r.course.sks, 0);

    return {
      academicYear: activeYear,
      counts: {
        krsCourses: krsRows.length,
        totalSks,
        publishedGrades,
      },
    };
  }
}
