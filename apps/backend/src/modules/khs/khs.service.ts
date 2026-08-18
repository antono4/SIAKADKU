import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { gradeToWeight } from '../../common/grading.util';

export interface KhsRow {
  courseCode: string;
  courseName: string;
  sks: number;
  semester: number;
  finalScore: number | null;
  grade: string | null;
  weight: number | null;
  qualityPoints: number | null;
}

export interface KhsResult {
  student: {
    id: number;
    npm: string;
    name: string;
    className: string | null;
    concentration?: { name: string } | null;
  };
  academicYear: { code: string; semester: string };
  rows: KhsRow[];
  totalSks: number;
  totalQualityPoints: number;
  ips: number; // indeks prestasi semester
  ipk: number; // indeks prestasi kumulatif
}

@Injectable()
export class KhsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(studentId: number, academicYearId: number): Promise<KhsResult> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { concentration: { select: { name: true } } },
    });
    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan.');

    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });
    if (!academicYear) throw new NotFoundException('Tahun ajaran tidak ditemukan.');

    const points = await this.prisma.studyPoint.findMany({
      where: { studentId, academicYearId, published: true },
      include: {
        course: { select: { courseCode: true, courseName: true, sks: true, semester: true } },
      },
      orderBy: { course: { semester: 'asc' } },
    });

    const rows: KhsRow[] = points.map((p) => {
      const weight = p.grade ? gradeToWeight(p.grade as 'A' | 'B' | 'C' | 'D' | 'E') : null;
      return {
        courseCode: p.course.courseCode,
        courseName: p.course.courseName,
        sks: p.course.sks,
        semester: p.course.semester,
        finalScore: p.finalScore,
        grade: p.grade,
        weight,
        qualityPoints: weight !== null ? weight * p.course.sks : null,
      };
    });

    const totalSks = rows.reduce((sum, r) => sum + r.sks, 0);
    const totalQualityPoints = rows.reduce(
      (sum, r) => sum + (r.qualityPoints ?? 0),
      0,
    );
    const ips = totalSks > 0 ? Math.round((totalQualityPoints / totalSks) * 100) / 100 : 0;

    // cumulative GPA across all published semesters
    const allPoints = await this.prisma.studyPoint.findMany({
      where: { studentId, published: true },
      include: { course: { select: { sks: true } } },
    });
    const cumSks = allPoints.reduce((s, p) => s + p.course.sks, 0);
    const cumQuality = allPoints.reduce((s, p) => {
      const w = p.grade ? gradeToWeight(p.grade as 'A' | 'B' | 'C' | 'D' | 'E') : 0;
      return s + w * p.course.sks;
    }, 0);
    const ipk = cumSks > 0 ? Math.round((cumQuality / cumSks) * 100) / 100 : 0;

    return {
      student: {
        id: student.id,
        npm: student.npm,
        name: student.name,
        className: student.className,
        concentration: student.concentration,
      },
      academicYear: { code: academicYear.code, semester: academicYear.semester },
      rows,
      totalSks,
      totalQualityPoints,
      ips,
      ipk,
    };
  }

  async transcript(studentId: number) {
    const allPoints = await this.prisma.studyPoint.findMany({
      where: { studentId, published: true },
      include: {
        course: { select: { courseCode: true, courseName: true, sks: true, semester: true } },
        academicYear: { select: { code: true, semester: true } },
      },
      orderBy: [{ academicYear: { code: 'asc' } }, { course: { semester: 'asc' } }],
    });

    const byYear = new Map<string, KhsRow[]>();
    for (const p of allPoints) {
      const key = `${p.academicYear.code}::${p.academicYear.semester}`;
      const weight = p.grade ? gradeToWeight(p.grade as 'A' | 'B' | 'C' | 'D' | 'E') : 0;
      const row: KhsRow = {
        courseCode: p.course.courseCode,
        courseName: p.course.courseName,
        sks: p.course.sks,
        semester: p.course.semester,
        finalScore: p.finalScore,
        grade: p.grade,
        weight,
        qualityPoints: weight * p.course.sks,
      };
      const list = byYear.get(key) ?? [];
      list.push(row);
      byYear.set(key, list);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { concentration: { select: { name: true } } },
    });
    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan.');

    const semesters = Array.from(byYear.entries()).map(([key, rows]) => {
      const [code, semester] = key.split('::');
      const totalSks = rows.reduce((s, r) => s + r.sks, 0);
      const totalQualityPoints = rows.reduce((s, r) => s + (r.qualityPoints ?? 0), 0);
      return {
        academicYear: { code, semester },
        rows,
        totalSks,
        ips: totalSks > 0 ? Math.round((totalQualityPoints / totalSks) * 100) / 100 : 0,
      };
    });

    const cumSks = allPoints.reduce((s, p) => s + p.course.sks, 0);
    const cumQuality = allPoints.reduce((s, p) => {
      const w = p.grade ? gradeToWeight(p.grade as 'A' | 'B' | 'C' | 'D' | 'E') : 0;
      return s + w * p.course.sks;
    }, 0);
    const ipk = cumSks > 0 ? Math.round((cumQuality / cumSks) * 100) / 100 : 0;

    return {
      student: {
        id: student.id,
        npm: student.npm,
        name: student.name,
        className: student.className,
        concentration: student.concentration,
      },
      semesters,
      totalSks: cumSks,
      ipk,
    };
  }
}
