import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  BulkCreatePlainStudyDto,
  CreatePlainStudyDto,
  KrsQuery,
} from './krs.dto';

@Injectable()
export class KrsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: KrsQuery) {
    const where = {
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.verified !== undefined ? { verified: query.verified === 'true' } : {}),
      ...(query.npm ? { student: { npm: query.npm } } : {}),
    };
    return this.prisma.plainStudy.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        student: { select: { id: true, npm: true, name: true, className: true } },
        course: { select: { id: true, courseCode: true, courseName: true, sks: true, semester: true } },
        schedule: {
          include: {
            lecturer: { select: { id: true, name: true } },
            classroom: { select: { name: true } },
          },
        },
        academicYear: { select: { id: true, code: true, semester: true } },
        verifiedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findByStudent(studentId: number, academicYearId?: number) {
    return this.prisma.plainStudy.findMany({
      where: { studentId, ...(academicYearId ? { academicYearId } : {}) },
      include: {
        course: true,
        schedule: { include: { lecturer: true, classroom: true } },
        academicYear: { select: { id: true, code: true, semester: true } },
        studyPoint: true,
      },
      orderBy: { course: { semester: 'asc' } },
    });
  }

  async create(dto: CreatePlainStudyDto) {
    const exists = await this.prisma.plainStudy.findUnique({
      where: {
        studentId_courseId_academicYearId: {
          studentId: dto.studentId,
          courseId: dto.courseId,
          academicYearId: dto.academicYearId,
        },
      },
    });
    if (exists) throw new BadRequestException('Mata kuliah sudah ada di KRS mahasiswa.');

    if (dto.scheduleId) {
      const schedule = await this.prisma.schedule.findUnique({ where: { id: dto.scheduleId } });
      if (schedule && schedule.enrolledCount >= schedule.capacity) {
        throw new BadRequestException('Kapasitas kelas sudah penuh.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const plain = await tx.plainStudy.create({
        data: dto,
        include: { course: true, schedule: { include: { lecturer: true } } },
      });
      if (dto.scheduleId) {
        await tx.schedule.update({
          where: { id: dto.scheduleId },
          data: { enrolledCount: { increment: 1 } },
        });
      }
      return plain;
    });
  }

  async bulkCreate(dto: BulkCreatePlainStudyDto) {
    return this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of dto.items) {
        const existing = await tx.plainStudy.findUnique({
          where: {
            studentId_courseId_academicYearId: {
              studentId: dto.studentId,
              courseId: item.courseId,
              academicYearId: dto.academicYearId,
            },
          },
          select: { id: true },
        });
        if (existing) continue;

        const plain = await tx.plainStudy.create({
          data: {
            studentId: dto.studentId,
            courseId: item.courseId,
            scheduleId: item.scheduleId,
            academicYearId: dto.academicYearId,
          },
        });
        if (item.scheduleId) {
          await tx.schedule.update({
            where: { id: item.scheduleId },
            data: { enrolledCount: { increment: 1 } },
          });
        }
        results.push(plain);
      }
      return { created: results.length };
    });
  }

  async verify(plainStudyIds: number[], verifierId: string) {
    await this.prisma.plainStudy.updateMany({
      where: { id: { in: plainStudyIds } },
      data: { verified: true, verifiedById: verifierId, verifiedAt: new Date() },
    });
    return { verified: plainStudyIds.length };
  }

  async remove(id: number) {
    const plain = await this.prisma.plainStudy.findUnique({ where: { id } });
    if (!plain) throw new NotFoundException('Item KRS tidak ditemukan.');
    return this.prisma.$transaction(async (tx) => {
      if (plain.scheduleId) {
        await tx.schedule.update({
          where: { id: plain.scheduleId },
          data: { enrolledCount: { decrement: 1 } },
        });
      }
      return tx.plainStudy.delete({ where: { id } });
    });
  }

  /** Calculate total SKS in a student's KRS for a given academic year. */
  async totalSks(studentId: number, academicYearId: number) {
    const rows = await this.prisma.plainStudy.findMany({
      where: { studentId, academicYearId },
      select: { course: { select: { sks: true } } },
    });
    return rows.reduce((sum, r) => sum + r.course.sks, 0);
  }
}
