import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateIngredientDto {
  @ApiProperty({ description: 'Nama bahan pangan', example: 'Telur Ayam' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'Label tampilan UI (chips)', 
    example: ['Sehat', 'Diet'],
    required: false 
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  label?: string[];

  @ApiProperty({ description: 'Nilai kalori', example: 155 })
  @Type(() => Number)
  @IsNumber()
  caloriesValue: number;

  @ApiProperty({ description: 'Nilai protein', example: 12.6 })
  @Type(() => Number)
  @IsNumber()
  proteinValue: number;

  @ApiProperty({ description: 'Nilai lemak', example: 10.6, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lemak?: number;

  @ApiProperty({ 
    description: 'Kandungan Vitamin', 
    example: ['A', 'B12', 'D'], 
    required: false 
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  vitamin?: string[];

  @ApiProperty({ description: 'Nilai Omega', example: 1500, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  omega?: number;

  @ApiProperty({ description: 'Nilai Kalsium', example: 300, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kalsium?: number;

  @ApiProperty({ description: 'Level Kalori', example: 'Menengah', required: false })
  @IsOptional()
  @IsString()
  calorieLevel?: string;

  @ApiProperty({ description: 'Level Protein', example: 'Tinggi', required: false })
  @IsOptional()
  @IsString()
  proteinLevel?: string;

  @ApiProperty({ description: 'Level Vitamin', example: 'Tinggi', required: false })
  @IsOptional()
  @IsString()
  vitaminLevel?: string;

  @ApiProperty({ 
    description: 'Highlight gizi utama', 
    example: ['Tinggi Protein', 'Kaya Omega'], 
    required: false 
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  highlights?: string[];

  @ApiProperty({ description: 'Cocok untuk siapa', example: 'Anak, Orang Tua, Diet', required: false })
  @IsOptional()
  @IsString()
  suitableFor?: string;

  @ApiProperty({ description: 'Kategori bahan', example: 'Protein Hewani', required: false })
  @IsOptional()
  @IsString()
  kategori?: string;

  @ApiProperty({ description: 'Perhatian/Attention', required: false })
  @IsOptional()
  @IsString()
  attention?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File gambar bahan pangan',
    required: false,
  })
  image?: any;

  imageUrl?: string;
}