import { Controller, Post, Body, Get, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { TripService } from '../../application/services/trip.service';
import { SearchTripDto } from '../../application/dtos/search-trip.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripController {
  constructor(private tripService: TripService) {}
  @Post('search')
  async search(@User() user: { userId: string }, @Body() dto: SearchTripDto) {
    return this.tripService.searchTrip(user.userId, dto);
  }
  @Get('history')
  async history(@User() user: { userId: string }, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.tripService.getHistory(user.userId, +page, +limit);
  }
  @Get('favorites')
  async favorites(@User() user: { userId: string }) {
    return this.tripService.getFavorites(user.userId);
  }
  @Post('favorites/:tripId')
  async addFavorite(@User() user: { userId: string }, @Param('tripId') tripId: string) {
    return this.tripService.favoriteTrip(user.userId, tripId);
  }
  @Delete('favorites/:tripId')
  async removeFavorite(@User() user: { userId: string }, @Param('tripId') tripId: string) {
    return this.tripService.removeFavorite(user.userId, tripId);
  }
}
