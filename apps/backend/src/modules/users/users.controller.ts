import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { createUserSchema, updateUserSchema } from './users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  findMany(@Query() query: { page?: string; perPage?: string; query?: string; role?: string }) {
    return this.users.findMany({
      page: query.page ? Number(query.page) : undefined,
      perPage: query.perPage ? Number(query.perPage) : undefined,
      query: query.query,
      role: query.role,
    });
  }

  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.users.profile(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() dto: unknown) {
    return this.users.create(dto as never);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: unknown) {
    return this.users.update(id, dto as never);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.users.remove(id);
  }
}
