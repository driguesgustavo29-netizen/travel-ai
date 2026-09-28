import { FlightOffer } from './flight-provider.interface';
import { HotelOffer } from './hotel-provider.interface';
export interface TripCombination {
  flight: FlightOffer;
  hotel: HotelOffer;
  totalPrice: number;
}
export interface RecommendationResult {
  combination: TripCombination;
  score: number;
  justification: string;
}
export interface RecommendationEngine {
  recommend(
    combinations: TripCombination[],
    budget: number,
    tripType: string,
    preferences?: Record<string, any>
  ): RecommendationResult;
}
