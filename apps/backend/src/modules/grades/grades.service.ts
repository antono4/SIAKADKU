import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { evaluateGrade } from '../../common/grading.util';
import type {
  BulkUpsertGradeDto,
  GradeQuery,
  UpsertGradeDto,
} from './grades.dto';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: GradeQuery) {
    const where = {
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.lecturerId ? { lecturerId: query.lecturerId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.published !== undefined ? { published: query.published === 'true' } : {}),
    };
    return this.prisma.studyPoint.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        student: { select: { id: true, npm: true, name: true, className: true } },
        course: { select: { id: true, courseCode: true, courseName: true, sks: true } },
        academicYear: { select: { id: true, code: true, semester: true } },
      },
    });
  }

  /** Lecturer entry-point: list students in a course/class with their current grades. */
  async forEntry(academicYearId: number, courseId: number) {
    const plainStudies = await this.prisma.plainStudy.findMany({
      where: { academicYearId, courseId, verified: true },
      include: {
        student: { select: { id: true, npm: true, name: true, className: true } },
        studyPoint: true,
      },
      orderBy: { student: { npm: 'asc' } },
    });
    return plainStudies.map((p) => ({
      plainStudyId: p.id,
      student: p.student,
      point: p.studyPoint ?? null,
    }));
  }

  async upsert(dto: UpsertGradeDto) {
    const { finalScore, grade, weight } = evaluateGrade({
      absent: dto.absent,
      task: dto.task,
      midterms: dto.midterms,
      final: dto.final,
    });

    return this.prisma.studyPoint.upsert({
      where: {
        studentId_courseId_academicYearId: {
          studentId: dto.studentId,
          courseId: dto.courseId,
          academicYearId: dto.academicYearId,
        },
      },
      create: {
        ...dto,
        finalScore,
        grade,
        weight,
        published: false,
      },
      update: {
        absent: dto.absent,
        task: dto.task,
        midterms: dto.midterms,
        final: dto.final,
        lecturerId: dto.lecturerId,
        finalScore,
        grade,
        weight,
      },
      include: {
        course: { select: { courseCode: true, courseName: true, sks: true } },
        student: { select: { npm: true, name: true } },
      },
    });
  }

  async bulkUpsert(dto: BulkUpsertGradeDto) {
    const results = [];
    for (const item of dto.items) {
      const result = await this.upsert({ ...item, lecturerId: item.lecturerId ?? dto.lecturerId });
      results.push(result);
    }
    return { saved: results.length };
  }

  async publish(studyPointIds: number[]) {
    await this.prisma.studyPoint.updateMany({
      where: { id: { in: studyPointIds } },
      data: { published: true },
    });
    return { published: studyPointIds.length };
  }

  async findByStudent(studentId: number, academicYearId?: number) {
    return this.prisma.studyPoint.findMany({
      where: { studentId, ...(academicYearId ? { academicYearId } : {}), published: true },
      include: {
        course: { select: { id: true, courseCode: true, courseName: true, sks: true, semester: true } },
        academicYear: { select: { code: true, semester: true } },
      },
      orderBy: { course: { semester: 'asc' } },
    });
  }

  async findOne(id: number) {
    const sp = await this.prisma.studyPoint.findUnique({ where: { id } });
    if (!sp) throw new NotFoundException('Data nilai tidak ditemukan.');
    return sp;
  }

  async remove(id: number) {
    return this.prisma.studyPoint.delete({ where: { id } });
  }
}
