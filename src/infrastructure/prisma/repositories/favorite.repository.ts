import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Favorite, Prisma } from '@prisma/client';

// Tipo que inclui a relação trip
export type FavoriteWithTrip = Prisma.FavoriteGetPayload<{
  include: { trip: true };
}>;

@Injectable()
export class FavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FavoriteCreateInput): Promise<Favorite> {
    return this.prisma.favorite.create({ data });
  }

  async delete(userId: string, tripId: string): Promise<Favorite> {
    return this.prisma.favorite.delete({
      where: { userId_tripId: { userId, tripId } },
    });
  }

  async findAllByUserId(userId: string): Promise<FavoriteWithTrip[]> {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { trip: true },
    });
  }

  async findByUserAndTrip(userId: string, tripId: string): Promise<Favorite | null> {
    return this.prisma.favorite.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
  }
}
