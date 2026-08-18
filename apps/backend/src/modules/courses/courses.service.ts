import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from '../../common/pagination.service';
import type { CourseQuery, CreateCourseDto, UpdateCourseDto } from './courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async findMany(query: CourseQuery) {
    const { page, perPage, skip, take } = this.pagination.parse(query);
    const where = {
      ...(query.query
        ? {
            OR: [
              { courseCode: { contains: query.query, mode: 'insensitive' as const } },
              { courseName: { contains: query.query, mode: 'insensitive' as const } },
              { courseNameEnglish: { contains: query.query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.semester ? { semester: query.semester } : {}),
      ...(query.concentrationId ? { concentrationId: query.concentrationId } : {}),
      ...(query.active !== undefined ? { active: query.active === 'true' } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          concentration: { select: { id: true, name: true, code: true } },
          requirementCourse: { select: { id: true, courseCode: true, courseName: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);
    return this.pagination.build(data, total, page, perPage);
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        concentration: true,
        requirementCourse: true,
        requiredBy: { select: { id: true, courseCode: true, courseName: true } },
      },
    });
    if (!course) throw new NotFoundException('Mata kuliah tidak ditemukan.');
    return course;
  }

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto, include: { concentration: true } });
  }

  async update(id: number, dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: dto, include: { concentration: true } });
  }

  async remove(id: number) {
    return this.prisma.course.delete({ where: { id } });
  }
}
