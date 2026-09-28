export interface HotelOffer {
  id: string;
  name: string;
  stars: number;
  rating: number;
  price: number;
  currency: string;
  address: string;
  distanceToBeach?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  checkIn: Date;
  checkOut: Date;
}
export interface HotelSearchParams {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  maxPrice?: number;
}
export interface HotelProvider {
  search(params: HotelSearchParams): Promise<HotelOffer[]>;
}
