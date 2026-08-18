import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/current-user.decorator';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: AuthenticatedUser['role'];
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokens(user: {
    id: string;
    username: string;
    name: string;
    role: AuthenticatedUser['role'];
    studentId?: number | null;
    lecturerId?: number | null;
  }) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '7d');

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: accessTtl,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: refreshTtl,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken, user };
  }

  get accessSecret(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  get refreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  async verifyRefresh(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa.');
    }
  }

  async revoke(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
