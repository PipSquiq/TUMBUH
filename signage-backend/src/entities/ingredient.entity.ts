import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeEntity } from 'src/entities/recipe.entity'; // ✅ Import relasi resep

@Entity('ingredients')
export class IngredientEntity {
  @ApiProperty({ description: 'ID unik bahan pangan' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nama bahan pangan (sebagai kunci label AI)', example: 'Ikan' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ description: 'Label untuk tampilan UI (chips)', example: ['Sehat', 'Diet'] })
  @Column({ type: 'simple-array', nullable: true })
  label: string[];

  @ApiProperty({ description: 'URL gambar referensi bahan pangan' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  // --- Data Nutrisi Utama ---
  @ApiProperty({ description: 'Nilai kalori/Energi per 100g', example: 120 })
  @Column({ type: 'int' })
  caloriesValue: number;

  @ApiProperty({ description: 'Nilai protein dalam gram', example: 20.5 })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  proteinValue: number;

  @ApiProperty({ description: 'Nilai lemak dalam gram', example: 5.2 })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  lemak: number;

  // --- Data Mikro Nutrisi ---
  @ApiProperty({ description: 'Indeks Vitamin yang terkandung', example: ['A', 'B', 'C'] })
  @Column({ type: 'simple-array', nullable: true })
  vitamin: string[];

  @ApiProperty({ description: 'Nilai Omega', example: 1500 })
  @Column({ type: 'int', nullable: true })
  omega: number;

  @ApiProperty({ description: 'Nilai Kalsium', example: 300 })
  @Column({ type: 'int', nullable: true })
  kalsium: number;

  // --- Data Level Nutrisi ---
  @Column({ type: 'varchar', length: 50, nullable: true })
  calorieLevel: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  proteinLevel: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vitaminLevel: string;

  // --- Data Detail Keunggulan ---
  @ApiProperty({ description: 'Keunggulan/Highlights', example: ['Tinggi Protein', 'Kaya Omega'] })
  @Column({ type: 'simple-array', nullable: true })
  highlights: string[];

  @ApiProperty({ description: 'Cocok untuk siapa', example: 'Anak, Orang Tua, Diet' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  suitableFor: string;

  @ApiProperty({ description: 'Kategori bahan pangan', example: 'Sayuran' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  kategori: string;

  @ApiProperty({ description: 'Perhatian/Attention' })
  @Column({ type: 'text', nullable: true })
  attention: string;

  // --- Relasi Baru ---
  @ManyToMany(() => RecipeEntity, (recipe) => recipe.mainIngredients)
  recipes: RecipeEntity[]; // ✅ Relasi balik ke Recipe

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}