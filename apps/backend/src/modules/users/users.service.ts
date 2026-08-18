import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from '../../common/pagination.service';
import type { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async findMany(query: { page?: number; perPage?: number; query?: string; role?: string }) {
    const { page, perPage, skip, take } = this.pagination.parse(query);
    const where = {
      ...(query.query
        ? {
            OR: [
              { name: { contains: query.query, mode: 'insensitive' as const } },
              { username: { contains: query.query, mode: 'insensitive' as const } },
              { email: { contains: query.query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role as never } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: this.select(),
      }),
      this.prisma.user.count({ where }),
    ]);
    return this.pagination.build(data, total, page, perPage);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: this.select() });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan.');
    return user;
  }

  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password } as never,
      select: this.select(),
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto };
    if (typeof dto.password === 'string' && dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    } else {
      delete data.password;
    }
    return this.prisma.user.update({ where: { id }, data: data as never, select: this.select() });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async profile(id: string) {
    return this.findOne(id);
  }

  private select() {
    return {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      active: true,
      studentId: true,
      lecturerId: true,
      lastLoginAt: true,
      createdAt: true,
    } as const;
  }
}
