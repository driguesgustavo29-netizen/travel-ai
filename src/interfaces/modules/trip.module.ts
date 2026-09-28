import { Module } from '@nestjs/common';
import { TripController } from '../controllers/trip.controller';
import { TripService } from '../../application/services/trip.service';
import { TripRepository } from '../../infrastructure/prisma/repositories/trip.repository';
import { SearchRepository } from '../../infrastructure/prisma/repositories/search.repository';
import { FavoriteRepository } from '../../infrastructure/prisma/repositories/favorite.repository';
import { AmadeusModule } from '../../infrastructure/providers/amadeus/amadeus.module';
import { BookingModule } from '../../infrastructure/providers/booking/booking.module';
import { RecommendationModule } from '../../infrastructure/providers/recommendation/recommendation.module';

@Module({
  imports: [AmadeusModule, BookingModule, RecommendationModule],
  controllers: [TripController],
  providers: [
    TripService,
    TripRepository,
    SearchRepository,
    FavoriteRepository,
  ],
})
export class TripModule {}

