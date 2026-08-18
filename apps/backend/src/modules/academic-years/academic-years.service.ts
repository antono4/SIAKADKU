import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateAcademicYearDto, UpdateAcademicYearDto } from './academic-years.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(query: { active?: string }) {
    const where = query.active !== undefined ? { active: query.active === 'true' } : undefined;
    return this.prisma.academicYear.findMany({
      where,
      orderBy: { code: 'desc' },
    });
  }

  findActive() {
    return this.prisma.academicYear.findFirst({ where: { active: true } });
  }

  async findOne(id: number) {
    const ay = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!ay) throw new NotFoundException('Tahun ajaran tidak ditemukan.');
    return ay;
  }

  async create(dto: CreateAcademicYearDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.active) {
        await tx.academicYear.updateMany({ data: { active: false }, where: { active: true } });
      }
      return tx.academicYear.create({ data: dto });
    });
  }

  async update(id: number, dto: UpdateAcademicYearDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.active) {
        await tx.academicYear.updateMany({ data: { active: false }, where: { active: true } });
      }
      return tx.academicYear.update({ where: { id }, data: dto });
    });
  }

  remove(id: number) {
    return this.prisma.academicYear.delete({ where: { id } });
  }
}
