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

  // --- RELASI KE PRODUK (JUALAN) ---
  @OneToMany(() => ProductEntity, (product: ProductEntity) => product.seller)
  products: ProductEntity[]; // Sinkronisasi dengan ProductEntity.seller

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}