import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: 'Jumlah produk yang dipesan', example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Jumlah minimal pemesanan adalah 1' })
  qty: number;

  @ApiProperty({ description: 'Alamat pengiriman', example: 'Jl. Merdeka No. 10, Bandung' })
  @IsNotEmpty({ message: 'Alamat pengiriman tidak boleh kosong' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Metode pembayaran yang dipilih', example: 'COD' })
  @IsNotEmpty({ message: 'Metode pembayaran tidak boleh kosong' })
  @IsString()
  payment_method: string;
}
