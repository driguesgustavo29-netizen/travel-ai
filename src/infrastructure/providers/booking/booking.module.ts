import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BookingHotelProvider } from './booking-hotel.provider';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), ConfigModule],
  providers: [BookingHotelProvider],
  exports: [BookingHotelProvider],
})
export class BookingModule {}
