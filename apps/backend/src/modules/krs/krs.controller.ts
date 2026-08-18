import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KrsService } from './krs.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  bulkCreatePlainStudySchema,
  createPlainStudySchema,
  krsQuerySchema,
  verifyKrsSchema,
} from './krs.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { UserRole } from '@siakad/shared';

@ApiTags('KRS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('krs')
export class KrsController {
  constructor(private readonly krs: KrsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN)
  @UsePipes(new ZodValidationPipe(krsQuerySchema))
  findMany(@Query() query: Record<string, string>) {
    return this.krs.findMany(query as never);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.AKADEMIK, UserRole.DOSEN, UserRole.MAHASISWA)
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.krs.findByStudent(studentId, academicYearId ? Number(academicYearId) : undefined);
  }

  @Post()
  @Roles(UserRole.MAHASISWA, UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(createPlainStudySchema))
  create(@Body() dto: unknown) {
    return this.krs.create(dto as never);
  }

  @Post('bulk')
  @Roles(UserRole.MAHASISWA, UserRole.AKADEMIK)
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(bulkCreatePlainStudySchema))
  bulkCreate(@Body() dto: unknown) {
    return this.krs.bulkCreate(dto as never);
  }

  @Patch('verify')
  @Roles(UserRole.AKADEMIK)
  @UsePipes(new ZodValidationPipe(verifyKrsSchema))
  verify(@Body() dto: { plainStudyIds: number[] }, @CurrentUser() user: { id: string }) {
    return this.krs.verify(dto.plainStudyIds, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.MAHASISWA, UserRole.AKADEMIK)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.krs.remove(id);
  }
}
