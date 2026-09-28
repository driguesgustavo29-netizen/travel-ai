import { Module } from '@nestjs/common';
import { AmadeusModule } from './amadeus/amadeus.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [AmadeusModule, BookingModule],
  exports: [AmadeusModule, BookingModule],
})
export class ProvidersModule {}
