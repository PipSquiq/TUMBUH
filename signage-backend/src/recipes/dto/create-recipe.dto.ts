import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, IsString, IsNumber, IsOptional, 
  IsArray, IsUUID, IsEnum 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateRecipeDto {
  @ApiProperty({ description: 'Nama resep', example: 'Nasi Goreng Spesial' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Status icon UI (Array)',
    example: ['sehat', 'pedas'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  iconStatus?: string[];

  @ApiProperty({
    description: 'Daftar UUID Ingredients (Array)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    required: false,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  mainIngredientIds?: string[];

  @ApiProperty({ description: 'Bahan pokok teks', example: 'Nasi' })
  @IsString()
  @IsNotEmpty()
  ingredients: string;

  @ApiProperty({ description: 'Detail bahan & takaran', required: false })
  @IsString()
  @IsOptional()
  recipeDetails?: string;

  @ApiProperty({ description: 'Alat masak', example: 'Wajan, Spatula' })
  @IsString()
  @IsNotEmpty()
  tools: string;

  @ApiProperty({ description: 'URL Video', required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  videoUrl?: string;

  @ApiProperty({ description: 'Deskripsi lengkap resep' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Waktu masak (menit)', example: 15 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  cookingTime: number;

  @ApiProperty({ description: 'Estimasi kalori', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value === '' ? undefined : value))
  caloriesValue?: number;

  @ApiProperty({ 
    description: 'Label resep (Array)', 
    example: ['Populer', 'Diet'],
    required: false 
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? value.split(',').map(v => v.trim()) : []))
  label?: string[];

  @ApiProperty({ description: 'Kategori', example: 'Masakan' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Instruksi masak' })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  @Transform(({ value }) => (value === '' ? 'active' : value))
  status?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File gambar untuk Cloudinary',
    required: false,
  })
  image?: any;

  imageUrl?: string;
}