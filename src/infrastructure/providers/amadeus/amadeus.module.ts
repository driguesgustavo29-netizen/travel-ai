import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AmadeusFlightProvider } from './amadeus-flight.provider';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), ConfigModule],
  providers: [AmadeusFlightProvider],
  exports: [AmadeusFlightProvider],
})
export class AmadeusModule {}
