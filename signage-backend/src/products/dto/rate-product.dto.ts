import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class RateProductDto {
  @ApiProperty({ 
    description: 'Rating bintang dari user (1-5)', 
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}