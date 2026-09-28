import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './interfaces/modules/auth.module';
import { UserModule } from './interfaces/modules/user.module';
import { TripModule } from './interfaces/modules/trip.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ProvidersModule } from './infrastructure/providers/providers.module';
import { RecommendationModule } from './infrastructure/providers/recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    PrismaModule,
    ProvidersModule,
    RecommendationModule,
    AuthModule,
    UserModule,
    TripModule,
  ],
})
export class AppModule {}

