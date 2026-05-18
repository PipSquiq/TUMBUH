import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { ProductEntity } from './product.entity';

@Entity('product_ratings')
@Unique(['user', 'product']) // KUNCI UTAMA: 1 User hanya bisa 1 kali di 1 Produk
export class ProductRatingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  score: number; // 1-5

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ProductEntity, (product) => product.id, { onDelete: 'CASCADE' })
  product: ProductEntity;
}