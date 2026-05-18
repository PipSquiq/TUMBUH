import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateScanDto {
  @ApiProperty({
    description: 'Label/kategori bahan yang terdeteksi oleh AI (Ikan, Ayam, Sayuran, dll)',
    example: 'Ikan',
  })
  @IsString()
  detectedLabel: string;

  @ApiProperty({
    description: 'Confidence score dari AI detection (0-100)',
    example: 95,
  })
  @IsNumber()
  confidenceScore: number;

  @ApiProperty({
    description: 'ID ingredient yang paling sesuai dari database (Relasi)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  ingredientId?: string; // Menggantikan matchedProductId

  @ApiProperty({
    description: 'Ringkasan singkat hasil scan',
    example: 'Bahan ini sangat segar dan kaya akan nutrisi.',
    required: false,
  })
  @IsString()
  @IsOptional()
  ringkasan?: string; // Kolom baru sesuai kebutuhan

  @ApiProperty({
    description: 'Daftar manfaat kesehatan dalam bentuk array',
    example: ['Tinggi Protein', 'Kaya Omega-3', 'Baik untuk Jantung'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[]; // Diubah dari string menjadi string[] agar cocok dengan simple-array
}