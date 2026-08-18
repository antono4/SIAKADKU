import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from '../../common/pagination.service';
import type { CreateLecturerDto, LecturerQuery, UpdateLecturerDto } from './lecturers.dto';

@Injectable()
export class LecturersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async findMany(query: LecturerQuery) {
    const { page, perPage, skip, take } = this.pagination.parse(query);
    const where = {
      ...(query.query
        ? {
            OR: [
              { lecturerCode: { contains: query.query, mode: 'insensitive' as const } },
              { name: { contains: query.query, mode: 'insensitive' as const } },
              { nidn: { contains: query.query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.concentrationId ? { concentrationId: query.concentrationId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.lecturer.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          concentration: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, username: true, active: true } },
        },
      }),
      this.prisma.lecturer.count({ where }),
    ]);
    return this.pagination.build(data, total, page, perPage);
  }

  async findOne(id: number) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan.');
    return lecturer;
  }

  async create(dto: CreateLecturerDto) {
    return this.prisma.lecturer.create({ data: dto });
  }

  async update(id: number, dto: UpdateLecturerDto) {
    return this.prisma.lecturer.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.lecturer.delete({ where: { id } });
  }
}
