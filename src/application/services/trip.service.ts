import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TripRepository } from '../../infrastructure/prisma/repositories/trip.repository';
import { SearchRepository } from '../../infrastructure/prisma/repositories/search.repository';
import { FavoriteRepository } from '../../infrastructure/prisma/repositories/favorite.repository';
import { AmadeusFlightProvider } from '../../infrastructure/providers/amadeus/amadeus-flight.provider';
import { BookingHotelProvider } from '../../infrastructure/providers/booking/booking-hotel.provider';
import { ScoreBasedRecommendationEngine } from '../../infrastructure/providers/recommendation/score-based.engine';
import { SearchTripDto } from '../dtos/search-trip.dto';

@Injectable()
export class TripService {
  constructor(
    private tripRepository: TripRepository,
    private searchRepository: SearchRepository,
    private favoriteRepository: FavoriteRepository,
    private flightProvider: AmadeusFlightProvider,
    private hotelProvider: BookingHotelProvider,
    private recommendationEngine: ScoreBasedRecommendationEngine,
  ) {}

  async searchTrip(userId: string, dto: SearchTripDto) {
    if (!dto.destination) throw new BadRequestException('Destination is required');

    const flights = await this.flightProvider.search({
      origin: dto.origin,
      destination: dto.destination,
      departureDate: new Date(dto.startDate),
      returnDate: new Date(dto.endDate),
      travelers: dto.travelers,
    });
    if (flights.length === 0) throw new BadRequestException('No flights found');

    const hotels = await this.hotelProvider.search({
      destination: dto.destination,
      checkIn: new Date(dto.startDate),
      checkOut: new Date(dto.endDate),
      guests: dto.travelers,
      maxPrice: dto.budget,
    });
    if (hotels.length === 0) throw new BadRequestException('No hotels found');

    const combinations = flights.flatMap(flight =>
      hotels.map(hotel => ({ flight, hotel, totalPrice: flight.price + hotel.price })),
    );
    const affordable = combinations.filter(c => c.totalPrice <= dto.budget);
    if (affordable.length === 0) {
      const cheapest = combinations.sort((a, b) => a.totalPrice - b.totalPrice)[0];
      throw new BadRequestException(
        'Nenhuma combinacao dentro do orcamento. Menor preco: R$ ' + cheapest.totalPrice.toFixed(2),
      );
    }

    const rec = this.recommendationEngine.recommend(affordable, dto.budget, dto.tripType);
    const result = {
      origin: dto.origin,
      destination: dto.destination,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalPrice: rec.combination.totalPrice,
      savings: dto.budget - rec.combination.totalPrice,
      flight: rec.combination.flight,
      hotel: rec.combination.hotel,
      aiJustification: rec.justification,
    };

    const search = await this.searchRepository.create({
      user: { connect: { id: userId } },
      origin: dto.origin,
      destination: dto.destination,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      travelers: dto.travelers,
      budget: dto.budget,
      tripType: dto.tripType,
      resultSummary: result as any,
    });

    return { id: search.id, ...result };
  }

  async getHistory(userId: string, page = 1, limit = 10) {
    const searches = await this.searchRepository.findAllByUserId(userId, page, limit);
    return searches.map(s => ({
      ...s,
      resultSummary: s.resultSummary
        ? { ...(s.resultSummary as any), id: s.id }
        : null,
    }));
  }

  async favoriteTrip(userId: string, searchId: string) {
    const search = await this.searchRepository.findById(searchId);
    if (!search) throw new NotFoundException('Pesquisa nao encontrada');
    if (search.userId !== userId) throw new NotFoundException('Pesquisa nao pertence a voce');

    const summary: any = search.resultSummary || {};
    const trip = await this.tripRepository.create({
      user: { connect: { id: userId } },
      origin: search.origin,
      destination: search.destination || '',
      startDate: search.startDate,
      endDate: search.endDate,
      travelers: search.travelers,
      budget: search.budget,
      tripType: search.tripType,
      totalPrice: summary.totalPrice || 0,
      flightDetails: summary.flight || {},
      hotelDetails: summary.hotel || {},
      aiJustification: summary.aiJustification || '',
      savings: summary.savings || 0,
    });

    const existing = await this.favoriteRepository.findByUserAndTrip(userId, trip.id);
    if (existing) throw new ConflictException('Viagem ja favoritada');

    return this.favoriteRepository.create({
      user: { connect: { id: userId } },
      trip: { connect: { id: trip.id } },
    });
  }

  async getFavorites(userId: string) {
    const favorites = await this.favoriteRepository.findAllByUserId(userId);
    return favorites.map(f => f.trip);
  }

  async removeFavorite(userId: string, tripId: string) {
    const existing = await this.favoriteRepository.findByUserAndTrip(userId, tripId);
    if (!existing) throw new NotFoundException('Favorito nao encontrado');
    await this.favoriteRepository.delete(userId, tripId);
  }
}
