import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FlightProvider, FlightOffer, FlightSearchParams } from '../../../domain/interfaces/flight-provider.interface';

@Injectable()
export class AmadeusFlightProvider implements FlightProvider {
  private readonly logger = new Logger(AmadeusFlightProvider.name);
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    const clientId = this.configService.get<string>('AMADEUS_API_KEY');
    const clientSecret = this.configService.get<string>('AMADEUS_API_SECRET');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId || '',
            client_secret: clientSecret || '',
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      const { access_token, expires_in } = response.data;
      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + expires_in * 1000;
      return access_token;
    } catch (error) {
      this.logger.error('Failed to get Amadeus token', error?.message);
      throw new HttpException('Flight API authentication failed', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async search(params: FlightSearchParams): Promise<FlightOffer[]> {
    // MODO MOCK: enquanto não tiver chaves reais, retorna dados fake
    const clientId = this.configService.get<string>('AMADEUS_API_KEY');
    if (!clientId || clientId === 'your-amadeus-key') {
      this.logger.warn('Amadeus keys not configured, returning mock data');
      return [
        { id: 'mock-f1', airline: 'LATAM', price: 2500, currency: 'BRL', departureDate: params.departureDate, arrivalDate: params.returnDate, origin: params.origin, destination: params.destination, stops: 0 },
        { id: 'mock-f2', airline: 'GOL', price: 2200, currency: 'BRL', departureDate: params.departureDate, arrivalDate: params.returnDate, origin: params.origin, destination: params.destination, stops: 1 },
      ];
    }
    const token = await this.getAccessToken();
    const depDate = params.departureDate.toISOString().split('T')[0];
    const retDate = params.returnDate.toISOString().split('T')[0];
    const url = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            departureDate: depDate,
            returnDate: retDate,
            adults: params.travelers.toString(),
            max: '10',
          },
        }),
      );
      const data = response.data;
      if (!data.data || data.data.length === 0) return [];
      return data.data.map((offer: any) => {
        const price = parseFloat(offer.price.gross || offer.price.total);
        const segments = offer.itineraries[0].segments;
        return {
          id: offer.id,
          airline: segments[0]?.carrierCode || 'Unknown',
          price,
          currency: offer.price.currency || 'BRL',
          departureDate: new Date(segments[0].departure.at),
          arrivalDate: new Date(segments[segments.length - 1].arrival.at),
          origin: params.origin,
          destination: params.destination,
          stops: segments.length - 1,
        };
      });
    } catch (error) {
      this.logger.error('Amadeus flight search failed', error?.message);
      throw new HttpException('Flight search failed', HttpStatus.BAD_GATEWAY);
    }
  }
}
