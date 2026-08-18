import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './token.service';
import type { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        password: true,
        active: true,
        studentId: true,
        lecturerId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kombinasi username dan password tidak valid.');
    }
    if (!user.active) {
      throw new BadRequestException('Akun Anda dinonaktifkan. Hubungi administrator.');
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Kombinasi username dan password tidak valid.');
    }

    const { password: _omit, ...safeUser } = user;
    return this.tokens.issueTokens(safeUser);
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokens.verifyRefresh(refreshToken);
    const stored = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        refreshToken: true,
        studentId: true,
        lecturerId: true,
      },
    });

    if (!stored || !stored.active || stored.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Sesi telah berakhir, silakan login kembali.');
    }

    return this.tokens.issueTokens({
      id: stored.id,
      username: stored.username,
      name: stored.name,
      role: stored.role,
      studentId: stored.studentId,
      lecturerId: stored.lecturerId,
    });
  }

  async logout(userId: string) {
    await this.tokens.revoke(userId);
  }

  async register(input: {
    name: string;
    username: string;
    email?: string;
    password: string;
    role: 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';
    studentId?: number;
    lecturerId?: number;
  }) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, ...(input.email ? [{ email: input.email }] : [])],
      },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Username atau email sudah terdaftar.');

    const password = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        password,
        role: input.role,
        studentId: input.studentId,
        lecturerId: input.lecturerId,
      },
      select: { id: true, username: true, name: true, role: true },
    });
    return user;
  }
}
