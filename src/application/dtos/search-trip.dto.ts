import { IsString, IsDateString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
export class SearchTripDto {
  @IsString() origin: string;
  @IsOptional() @IsString() destination?: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsInt() @Min(1) travelers: number;
  @IsNumber() @Min(0) budget: number;
  @IsString() tripType: string;
}
