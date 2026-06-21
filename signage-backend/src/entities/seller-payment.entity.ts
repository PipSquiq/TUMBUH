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
import { UserEntity } from './user.entity';

@Entity('seller_payments')
export class SellerPaymentEntity {
  @ApiProperty({ description: 'ID unik metode pembayaran' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Jenis pembayaran',
    enum: ['bank_transfer', 'e_wallet', 'cod'],
    example: 'bank_transfer',
  })
  @Column({
    type: 'varchar',
    length: 20,
  })
  type: string;

  @ApiProperty({
    description: 'Nama provider (BCA, BNI, Mandiri, GoPay, Dana, OVO, dll)',
    example: 'BCA',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string;

  @ApiProperty({
    description: 'Nomor rekening atau nomor e-wallet',
    example: '1234567890',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  accountNumber: string;

  @ApiProperty({
    description: 'Nama pemegang rekening atau akun',
    example: 'Budi Santoso',
    required: false,
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  accountName: string;

  @ManyToOne(() => UserEntity, (user) => user.sellerPayments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
