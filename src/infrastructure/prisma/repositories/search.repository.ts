import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Search, Prisma } from '@prisma/client';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.SearchCreateInput): Promise<Search> {
    return this.prisma.search.create({ data });
  }
  async findById(id: string): Promise<Search | null> {
    return this.prisma.search.findUnique({ where: { id } });
  }
  async findAllByUserId(userId: string, page = 1, limit = 10): Promise<Search[]> {
    return this.prisma.search.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
