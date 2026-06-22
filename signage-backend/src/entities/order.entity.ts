import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/entities/product.entity';
import { UserEntity } from 'src/entities/user.entity';

@Entity('orders')
export class OrderEntity {
  @ApiProperty({
    description: 'ID unik pemesanan menggunakan UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nama produk yang dipesan',
    example: 'Salad Sayur Segar Bu Ayu',
  })
  @Column({ type: 'varchar', length: 100 })
  product_name: string;

  @ApiProperty({
    description: 'Jumlah produk yang dipesan',
    example: 2,
  })
  @Column({ type: 'int' })
  qty: number;

  @ApiProperty({
    description: 'Nama pembeli',
    example: 'rafid_user',
  })
  @Column({ type: 'varchar', length: 100 })
  buyer_name: string;

  @ApiProperty({
    description: 'Alamat pengiriman',
    example: 'Jl. Merdeka No. 10, Bandung',
  })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({
    description: 'Status pemesanan',
    example: 'pending',
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending',
  })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @ApiProperty({
    description: 'Bukti pembayaran berupa URL gambar',
    example: 'https://cloudinary.com/...',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_proof: string;

  @ApiProperty({
    description: 'Status pembayaran',
    example: 'unpaid',
    enum: ['unpaid', 'waiting', 'verified', 'rejected'],
    default: 'unpaid',
  })
  @Column({ type: 'varchar', length: 50, default: 'unpaid' })
  payment_status: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
