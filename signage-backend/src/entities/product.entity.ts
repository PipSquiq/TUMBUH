// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/entities/user.entity';

@Entity('products')
export class ProductEntity {
  @ApiProperty({ description: 'ID unik produk', example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Salad Sayur Segar Bu Ayu' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ example: 'Salad segar dari kebun sendiri' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 'Sayuran' })
  @Column({ type: 'varchar', length: 50, default: 'Umum' })
  label: string;

  @ApiProperty({ example: 'Masakan' })
  @Column({ type: 'varchar', length: 50 })
  category: string;

  @ApiProperty({ example: 10000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  // --- RELASI FORMAL KE SELLER ---
  @ApiProperty({ description: 'Data Lengkap Penjual' })
  @ManyToOne(() => UserEntity, (user) => user.products, { onDelete: 'CASCADE' })
  seller: UserEntity; // ✅ Relasi objek ke tabel users

  @ApiProperty({ example: 'Desa Cipageran' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mapsLink: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  whatsappLink: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  suitableFor: string;

  @Column({ type: 'text', nullable: true })
  caution: string;

  @Column({ type: 'int', nullable: true })
  caloriesValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  proteinValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatValue: number;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}