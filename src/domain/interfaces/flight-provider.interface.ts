export interface FlightOffer {
  id: string;
  airline: string;
  price: number;
  currency: string;
  departureDate: Date;
  arrivalDate: Date;
  origin: string;
  destination: string;
  stops: number;
  deepLink?: string;
}
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  travelers: number;
}
export interface FlightProvider {
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
}
