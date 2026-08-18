import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { loginSchema, refreshSchema } from './auth.dto';
import { Public } from '../../common/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login pengguna (semua peran)' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: { username: string; password: string }) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Perpanjang sesi dengan refresh token' })
  @UsePipes(new ZodValidationPipe(refreshSchema))
  refresh(@Body() dto: { refreshToken: string }) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cabut refresh token pengguna' })
  async logout(@Body() body: { userId?: string }) {
    if (!body?.userId) return;
    await this.tokens.revoke(body.userId);
  }
}
