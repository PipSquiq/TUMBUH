import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeEntity } from './recipe.entity';
import { ProductEntity } from './product.entity';
import { VideoEntity } from './video.entity';
import { SellerPaymentEntity } from './seller-payment.entity';

@Entity('users')
export class UserEntity {
  @ApiProperty({ description: 'ID unik user menggunakan UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'rafid_user' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: '081234567890' })
  @Column({ unique: true })
  phoneNumber: string;

  @Column() // Password tidak diberi ApiProperty untuk keamanan
  password: string;

  @ApiProperty({ example: 'user', default: 'user' })
  @Column({ default: 'user' })
  role: string;

  // --- RELASI KE RESEP (FAVORIT) ---
  @ManyToMany(() => RecipeEntity, (recipe) => recipe.likedBy)
  @JoinTable({
    name: 'user_liked_recipes',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'recipeId', referencedColumnName: 'id' },
  })
  likedRecipes: RecipeEntity[]; //

  // --- RELASI KE VIDEO (FAVORIT) ---
  @ManyToMany(() => VideoEntity, (video) => video.likedBy)
  @JoinTable({
    name: 'user_liked_videos',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'videoId', referencedColumnName: 'id' },
  })
  likedVideos: VideoEntity[];

  // --- RELASI KE PRODUK (JUALAN) ---
  @OneToMany(() => ProductEntity, (product: ProductEntity) => product.seller)
  products: ProductEntity[]; // Sinkronisasi dengan ProductEntity.seller

  // --- STATUS PENJUAL ---
  @ApiProperty({ example: false, default: false })
  @Column({ default: false })
  isSeller: boolean;

  // --- RELASI KE DATA PEMBAYARAN PENJUAL ---
  @OneToMany(() => SellerPaymentEntity, (payment) => payment.user)
  sellerPayments: SellerPaymentEntity[];

  // --- TARIF ONGKIR WILAYAH PENJUAL ---
  @ApiProperty({ example: 0, default: 0, description: 'Ongkir ke Cimahi Utara' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCimahiUtara: number;

  @ApiProperty({ example: 0, default: 0, description: 'Ongkir ke Kota Cimahi & sekitarnya' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCimahiKota: number;

  @ApiProperty({ example: 0, default: 0, description: 'Ongkir ke Bandung & sekitarnya' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingBandung: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}