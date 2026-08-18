import { Injectable } from '@nestjs/common';
import type { Paginated, PaginationQuery } from '@siakad/shared';

@Injectable()
export class PaginationService {
  parse(query: PaginationQuery, defaults = { perPage: 20 }) {
    const page = Math.max(1, Number(query.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? defaults.perPage)));
    const skip = (page - 1) * perPage;
    return { page, perPage, skip, take: perPage };
  }

  build<T>(data: T[], total: number, page: number, perPage: number): Paginated<T> {
    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1,
    };
  }
}
