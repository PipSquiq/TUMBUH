import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IngredientEntity } from './ingredient.entity';

@Entity('scans')
export class ScanEntity {
  @ApiProperty({
    description: 'ID unik scan menggunakan UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Label/kategori bahan yang terdeteksi oleh AI',
    example: 'Ikan',
  })
  @Column({ type: 'varchar', length: 100 })
  detectedLabel: string;

  @ApiProperty({
    description: 'Confidence score dari AI detection (0-100)',
    example: 95,
  })
  @Column({ type: 'int', default: 0 })
  confidenceScore: number;

  // --- RELASI KE INGREDIENTS ---
  // Relasi ini menangani: name, kalori, protein, lemak, calorieLevel, proteinLevel, vitaminLevel
  @ApiProperty({ description: 'Relasi ke data bahan pangan untuk detail nutrisi' })
  @ManyToOne(() => IngredientEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: IngredientEntity;
  // -----------------------------

  @ApiProperty({
    description: 'Ringkasan singkat hasil scan',
    example: 'Bahan ini sangat segar dan kaya akan nutrisi.',
  })
  @Column({ type: 'text', nullable: true })
  ringkasan: string;

  @ApiProperty({
    description: 'Daftar manfaat kesehatan (array)',
    example: ['Tinggi Protein', 'Kaya Omega-3', 'Baik untuk Jantung'],
  })
  @Column({ type: 'simple-array', nullable: true })
  benefits: string[]; // Diubah ke array

  @ApiProperty({
    description: 'Waktu scanning dilakukan',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  scannedAt: Date;
}