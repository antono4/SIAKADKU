import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DAY_ORDER } from '@siakad/shared';
import type { CreateScheduleDto, ScheduleQuery, UpdateScheduleDto } from './schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ScheduleQuery) {
    const where = {
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.lecturerId ? { lecturerId: query.lecturerId } : {}),
      ...(query.day ? { day: query.day } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
    };
    const schedules = await this.prisma.schedule.findMany({
      where,
      orderBy: [{ day: 'asc' }, { sessionStart: 'asc' }],
      include: {
        course: { select: { id: true, courseCode: true, courseName: true, sks: true, semester: true } },
        lecturer: { select: { id: true, lecturerCode: true, name: true } },
        classroom: { select: { id: true, code: true, name: true } },
        academicYear: { select: { id: true, code: true, semester: true } },
      },
    });
    // sort by day-of-week ordering
    return schedules.sort((a, b) => {
      const ai = DAY_ORDER.indexOf(a.day as unknown as (typeof DAY_ORDER)[number]);
      const bi = DAY_ORDER.indexOf(b.day as unknown as (typeof DAY_ORDER)[number]);
      return ai - bi;
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        course: true,
        lecturer: true,
        classroom: true,
        academicYear: true,
      },
    });
    if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan.');
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    try {
      const schedule = await this.prisma.schedule.create({
        data: dto,
        include: { course: true, lecturer: true, classroom: true },
      });
      return schedule;
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('Jadwal dengan kombinasi tersebut sudah ada.');
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateScheduleDto) {
    return this.prisma.schedule.update({ where: { id }, data: dto, include: { course: true } });
  }

  async remove(id: number) {
    return this.prisma.schedule.delete({ where: { id } });
  }
}
