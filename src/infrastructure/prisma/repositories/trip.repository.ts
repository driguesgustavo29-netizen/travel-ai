import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Trip, Prisma } from '@prisma/client';

@Injectable()
export class TripRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.TripCreateInput): Promise<Trip> {
    return this.prisma.trip.create({ data });
  }
  async findById(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({ where: { id } });
  }
  async findAllByUserId(userId: string, page = 1, limit = 10): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
  async delete(id: string): Promise<Trip> {
    return this.prisma.trip.delete({ where: { id } });
  }
}
