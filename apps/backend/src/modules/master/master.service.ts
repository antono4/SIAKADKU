import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Concentrations ─────────────────────────────
  findConcentrations() {
    return this.prisma.concentration.findMany({ orderBy: { id: 'asc' } });
  }

  createConcentration(data: { code: string; name: string; description?: string }) {
    return this.prisma.concentration.create({ data });
  }

  updateConcentration(id: number, data: { code?: string; name?: string; description?: string }) {
    return this.prisma.concentration.update({ where: { id }, data });
  }

  async removeConcentration(id: number) {
    const inUse =
      (await this.prisma.student.count({ where: { concentrationId: id } })) +
      (await this.prisma.course.count({ where: { concentrationId: id } }));
    if (inUse > 0) {
      throw new NotFoundException('Konsentrasi masih dipakai oleh mahasiswa atau mata kuliah.');
    }
    return this.prisma.concentration.delete({ where: { id } });
  }

  // ── Classrooms ─────────────────────────────────
  findClassrooms() {
    return this.prisma.classroom.findMany({ orderBy: { id: 'asc' } });
  }

  createClassroom(data: { code: string; name: string; capacity?: number; building?: string }) {
    return this.prisma.classroom.create({ data });
  }

  updateClassroom(id: number, data: { code?: string; name?: string; capacity?: number; building?: string }) {
    return this.prisma.classroom.update({ where: { id }, data });
  }

  removeClassroom(id: number) {
    return this.prisma.classroom.delete({ where: { id } });
  }
}
