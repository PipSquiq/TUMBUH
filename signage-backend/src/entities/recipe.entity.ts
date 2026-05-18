import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { IngredientEntity } from './ingredient.entity';

@Entity('recipes')
export class RecipeEntity {
  @ApiProperty({
    description: 'ID unik resep menggunakan UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nama resep lengkap',
    example: 'Nasi Goreng Spesial Ala Tumbuh',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Status icon untuk UI (contoh: sehat, diet, pedas)',
    example: ['sehat', 'pedas'],
  })
  @Column({ type: 'simple-array', nullable: true })
  iconStatus: string[];

  @ApiProperty({
    description: 'Daftar bahan pangan utama yang terelasi secara formal ke tabel ingredients',
  })
  @ManyToMany(() => IngredientEntity, (ingredient) => ingredient.recipes)
  @JoinTable({
    name: 'recipe_ingredients_relation',
  })
  mainIngredients: IngredientEntity[];

  @ApiProperty({
    description: 'Bahan pokok utama resep dalam bentuk teks (untuk pencarian cepat)',
    example: 'Nasi, Telur, Kerupuk',
  })
  @Column({ type: 'text' })
  ingredients: string;

  @ApiProperty({
    description: 'Daftar bahan-bahan detail termasuk bumbu dan takaran spesifik',
    example: '2 siung bawang putih, 1 sdm kecap manis, garam secukupnya',
  })
  @Column({ type: 'text', nullable: true })
  recipeDetails: string;

  @ApiProperty({
    description: 'Daftar alat-alat masak yang dibutuhkan',
    example: 'Wajan, Spatula, Blender, Panci',
  })
  @Column({ type: 'text', nullable: true })
  tools: string;

  @ApiProperty({
    description: 'URL Link video tutorial (YouTube/Drive)',
    example: 'https://www.youtube.com/watch?v=example',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string;

  @ApiProperty({
    description: 'Deskripsi singkat mengenai cita rasa dan keunggulan resep',
    example: 'Nasi goreng dengan bumbu khas rempah nusantara',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Waktu memasak yang dibutuhkan dalam satuan menit',
    example: 15,
  })
  @Column({ type: 'int' })
  cookingTime: number;

  @ApiProperty({
    description: 'URL gambar resep yang tersimpan di Cloudinary',
    example: 'https://res.cloudinary.com/demo/image/upload/recipe.jpg',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @ApiProperty({
    description: 'Estimasi nilai kalori per satu porsi sajian',
    example: 206,
  })
  @Column({ type: 'int', nullable: true })
  caloriesValue: number;

  @ApiProperty({
    description: 'Label kategori tambahan resep (Array)',
    example: ['Populer', 'Rekomendasi', 'Terbaru'],
  })
  @Column({ type: 'simple-array', nullable: true })
  label: string[];

  @ApiProperty({
    description: 'Kategori besar resep',
    example: 'Masakan Utama',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @ApiProperty({
    description: 'Langkah-langkah pembuatan resep secara berurutan',
    example: '1. Panaskan minyak. 2. Tumis bumbu hingga harum.',
  })
  @Column({ type: 'text' })
  instructions: string;

  @ApiProperty({
    description: 'Status publikasi resep (active/inactive)',
    example: 'active',
    default: 'active',
  })
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @ManyToMany(() => UserEntity, (user) => user.likedRecipes)
  likedBy: UserEntity[];

  @ApiProperty({ description: 'Waktu pembuatan data' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Waktu pembaruan data terakhir' })
  @UpdateDateColumn()
  updatedAt: Date;
}