import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.option.findMany();
    return Object.fromEntries(rows.map((r) => [r.name, r.value]));
  }

  async get(name: string) {
    const row = await this.prisma.option.findUnique({ where: { name } });
    return row?.value ?? null;
  }

  async upsert(name: string, value: string) {
    return this.prisma.option.upsert({
      where: { name },
      create: { name, value },
      update: { value },
    });
  }

  async bulkUpsert(entries: Record<string, string>) {
    return this.prisma.$transaction(
      Object.entries(entries).map(([name, value]) =>
        this.prisma.option.upsert({
          where: { name },
          create: { name, value },
          update: { value },
        }),
      ),
    );
  }
}
