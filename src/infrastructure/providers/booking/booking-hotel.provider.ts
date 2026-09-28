import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HotelProvider, HotelOffer, HotelSearchParams } from '../../../domain/interfaces/hotel-provider.interface';

@Injectable()
export class BookingHotelProvider implements HotelProvider {
  private readonly logger = new Logger(BookingHotelProvider.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async search(params: HotelSearchParams): Promise<HotelOffer[]> {
    const apiKey = this.configService.get<string>('BOOKING_API_KEY');
    // MODO MOCK enquanto não tiver chave real
    if (!apiKey || apiKey === 'your-booking-rapidapi-key') {
      this.logger.warn('Booking key not configured, returning mock data');
      return [
        { id: 'mock-h1', name: 'Hilton Resort', stars: 4, rating: 8.7, price: 3000, currency: 'BRL', address: 'Orlando, FL', distanceToBeach: 5, checkIn: params.checkIn, checkOut: params.checkOut },
        { id: 'mock-h2', name: 'Marriott', stars: 3, rating: 7.5, price: 2400, currency: 'BRL', address: 'Orlando, FL', distanceToBeach: 12, checkIn: params.checkIn, checkOut: params.checkOut },
      ];
    }
    // TODO: integrar com Booking RapidAPI quando tiver chave
    return [];
  }
}
