import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, MinLength, IsEnum, IsUrl, IsNotEmpty, Min
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Sanitize, Trim } from '../../common/decorators/sanitize.decorator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nama produk', example: 'Salad Sayur Segar Bu Ayu' })
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  @IsString()
  @MinLength(3)
  @Sanitize()
  @Trim()
  name: string;

  @ApiProperty({ description: 'Deskripsi singkat produk', example: 'Sayuran organik tanpa pestisida' })
  @IsNotEmpty({ message: 'Deskripsi wajib diisi' })
  @IsString()
  @MinLength(10)
  @Sanitize()
  description: string;

  @ApiProperty({ description: 'Kategori untuk pencarian scan', example: 'Sayuran' })
  @IsNotEmpty({ message: 'Label scan wajib diisi' })
  @IsString()
  @Trim()
  label: string;

  @ApiProperty({
    description: 'Kategori produk',
    example: 'Masakan',
    enum: ['Terbaru', 'Populer', 'Camilan', 'Masakan', 'Minuman', 'Bahan Mentah'],
  })
  @IsEnum(['Terbaru', 'Populer', 'Camilan', 'Masakan', 'Minuman', 'Bahan Mentah'])
  category: string;

  @ApiProperty({ description: 'Harga dalam Rupiah', example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @Min(500)
  price: number;

  @ApiProperty({ description: 'Lokasi desa/kecamatan', example: 'Desa Cipageran' })
  @IsNotEmpty({ message: 'Lokasi wajib diisi' })
  @IsString()
  @Trim()
  location: string;

  @ApiProperty({ description: 'Link WhatsApp aktif', example: 'https://wa.me/6281234567890', required: false })
  @IsOptional()
  @IsString()
  whatsappLink?: string;

  @ApiProperty({ description: 'Stok tersedia', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload gambar produk',
  })
  image: any;

  // Field Internal (Otomatis dari Sistem)
  imageUrl?: string;
  sellerId?: string;

  // --- FIELD OPSIONAL (Bisa dikosongkan) ---
  @ApiProperty({ required: false, example: 'Tinggi Serat' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  benefits?: string;

  @ApiProperty({ required: false, example: 'https://maps.google.com/...' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  mapsLink?: string;

  @ApiProperty({ required: false, example: 120 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  caloriesValue?: number;

  @ApiProperty({ required: false, example: 'available', enum: ['available', 'unavailable'] })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(['available', 'unavailable'])
  status?: string;
}