import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from '../../common/pagination.service';
import type { CreateStudentDto, StudentQuery, UpdateStudentDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async findMany(query: StudentQuery) {
    const { page, perPage, skip, take } = this.pagination.parse(query);
    const where = {
      ...(query.query
        ? {
            OR: [
              { npm: { contains: query.query, mode: 'insensitive' as const } },
              { name: { contains: query.query, mode: 'insensitive' as const } },
              { address: { contains: query.query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.class ? { className: query.class } : {}),
      ...(query.gender ? { gender: query.gender } : {}),
      ...(query.registration ? { registerYear: query.registration } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.concentrationId ? { concentrationId: query.concentrationId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          concentration: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, username: true, active: true } },
        },
      }),
      this.prisma.student.count({ where }),
    ]);
    return this.pagination.build(data, total, page, perPage);
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        concentration: true,
        user: { select: { id: true, username: true, email: true, active: true } },
        parents: true,
        originSchool: true,
      },
    });
    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan.');
    return student;
  }

  async findByNpm(npm: string) {
    return this.prisma.student.findUnique({ where: { npm } });
  }

  async create(dto: CreateStudentDto) {
    const { parent, originSchool, ...data } = dto;
    return this.prisma.student.create({
      data: {
        ...data,
        ...(parent ? { parents: { create: parent } } : {}),
        ...(originSchool ? { originSchool: { create: originSchool } } : {}),
      } as never,
      include: { concentration: true },
    });
  }

  async update(id: number, dto: UpdateStudentDto) {
    const { parent, originSchool, ...data } = dto;
    return this.prisma.student.update({
      where: { id },
      data: {
        ...data,
        ...(parent
          ? { parents: { upsert: { create: parent, update: parent } } }
          : {}),
        ...(originSchool
          ? { originSchool: { upsert: { create: originSchool, update: originSchool } } }
          : {}),
      } as never,
      include: { concentration: true, parents: true, originSchool: true },
    });
  }

  async remove(id: number) {
    return this.prisma.student.delete({ where: { id } });
  }

  async importMany(rows: CreateStudentDto[]) {
    const result = await this.prisma.$transaction(
      rows.map((row) =>
        this.prisma.student.upsert({
          where: { npm: row.npm },
          create: { ...row } as never,
          update: { ...row } as never,
        }),
      ),
    );
    return { imported: result.length };
  }

  async stats() {
    const [total, active, nonactive, graduated, byYear] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.student.count({ where: { status: 'nonactive' } }),
      this.prisma.student.count({ where: { status: 'graduated' } }),
      this.prisma.student.groupBy({
        by: ['registerYear'],
        _count: { _all: true },
        orderBy: { registerYear: 'asc' },
      }),
    ]);
    return { total, active, nonactive, graduated, byYear };
  }
}
