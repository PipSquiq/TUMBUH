import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { ProductRatingEntity } from '../entities/product-rating.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UserEntity } from 'src/entities/user.entity';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,

    @InjectRepository(ProductRatingEntity)
    private ratingsRepository: Repository<ProductRatingEntity>,

    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,
  ) {}

  /**
   * Create Product
   * Seller ID otomatis diambil dari User yang sedang login
   */
  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const { sellerId, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      seller: { id: sellerId } as UserEntity,
    });

    return await this.productsRepository.save(product);
  }

  /**
   * Rating System with Toggle Logic
   * Click same star = Remove rating
   * Click different star = Update rating
   */
  async rateProduct(productId: string, userId: string, score: number): Promise<ProductEntity> {
    const product = await this.findOne(productId);
    
    const existingRating = await this.ratingsRepository.findOne({
      where: { product: { id: productId }, user: { id: userId } },
    });

    let totalScoreBefore = Number(product.rating) * product.reviewCount;

    if (existingRating) {
      if (existingRating.score === score) {
        // --- TOGGLE OFF (HAPUS RATING) ---
        await this.ratingsRepository.remove(existingRating);
        
        const newReviewCount = Math.max(0, product.reviewCount - 1);
        const remainingScore = totalScoreBefore - existingRating.score;
        
        product.rating = newReviewCount > 0 ? parseFloat((remainingScore / newReviewCount).toFixed(1)) : 0;
        product.reviewCount = newReviewCount;
      } else {
        // --- UPDATE RATING ---
        const oldScore = existingRating.score;
        existingRating.score = score;
        await this.ratingsRepository.save(existingRating);

        const updatedTotalScore = (totalScoreBefore - oldScore) + score;
        product.rating = parseFloat((updatedTotalScore / product.reviewCount).toFixed(1));
      }
    } else {
      // --- RATING BARU ---
      const newRating = this.ratingsRepository.create({
        score,
        user: { id: userId } as UserEntity,
        product: { id: productId } as ProductEntity,
      });
      await this.ratingsRepository.save(newRating);

      const newReviewCount = product.reviewCount + 1;
      const updatedTotalScore = totalScoreBefore + score;
      
      product.rating = parseFloat((updatedTotalScore / newReviewCount).toFixed(1));
      product.reviewCount = newReviewCount;
    }

    return await this.productsRepository.save(product);
  }

  /**
   * Find All Products with Search and Category
   * Ordered by highest rating and most reviews
   */
  async findAll(category?: string, search?: string): Promise<ProductEntity[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller');

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR seller.username ILIKE :search OR product.label ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('product.rating', 'DESC')
         .addOrderBy('product.reviewCount', 'DESC');

    return await query.getMany();
  }

  /**
   * Find One Product
   * Wajib include relations 'seller' untuk pengecekan ownership
   */
  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['seller'], 
    });

    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  /**
   * Random products for Recommendation
   */
  async findRandom(): Promise<ProductEntity[]> {
    return await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .orderBy('RANDOM()')
      .limit(4)
      .getMany();
  }

  /**
   * Update Product with Ownership Check
   */
  async update(id: string, updateProductDto: Partial<CreateProductDto>, userId: string): Promise<ProductEntity> {
    const product = await this.findOne(id);

    // VALIDASI KEPEMILIKAN
    if (product.seller.id !== userId) {
      throw new ForbiddenException(`Akses Ditolak! Anda bukan pemilik produk ini.`);
    }

    const { sellerId, ...productData } = updateProductDto;
    Object.assign(product, productData);
    
    return await this.productsRepository.save(product);
  }

  /**
   * Remove Product with Ownership Check
   * Menggunakan .remove() agar constraint entity terbaca sempurna
   */
  async remove(id: string, userId: string): Promise<void> {
    const product = await this.findOne(id);

    // VALIDASI KEPEMILIKAN
    if (product.seller.id !== userId) {
      throw new ForbiddenException(
        `Akses Ditolak! Produk ini milik ${product.seller.username}. Anda tidak bisa menghapusnya.`
      );
    }

    // Eksekusi penghapusan objek entity
    await this.productsRepository.remove(product);
  }

  /**
   * Membuat pemesanan baru untuk produk tertentu
   */
  async createOrder(
    productId: string,
    user: UserEntity,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderEntity> {
    const product = await this.findOne(productId);

    if (product.status === 'unavailable') {
      throw new BadRequestException('Produk tidak tersedia untuk dipesan');
    }

    if (product.stock < createOrderDto.qty) {
      throw new BadRequestException('Stok produk tidak mencukupi');
    }

    // Kurangi stok produk
    product.stock -= createOrderDto.qty;
    if (product.stock === 0) {
      product.status = 'unavailable';
    }
    await this.productsRepository.save(product);

    // Buat pesanan baru
    const order = this.ordersRepository.create({
      product_name: product.name,
      qty: createOrderDto.qty,
      buyer_name: user.username,
      address: createOrderDto.address,
      status: 'pending',
      product,
      buyer: user,
    });

    return await this.ordersRepository.save(order);
  }

  /**
   * Mengambil semua pesanan masuk untuk produk-produk milik penjual
   */
  async getSellerOrders(sellerId: string): Promise<OrderEntity[]> {
    // Sinkronisasi data lama yang berstatus null menjadi 'pending'
    await this.ordersRepository.update({ status: IsNull() }, { status: 'pending' });

    return await this.ordersRepository.find({
      where: {
        product: {
          seller: {
            id: sellerId,
          },
        },
      },
      relations: ['product', 'buyer'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Mengubah status pesanan menjadi selesai (completed)
   */
  async completeOrder(orderId: string, sellerId: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['product', 'product.seller'],
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (!order.product || !order.product.seller || order.product.seller.id !== sellerId) {
      throw new ForbiddenException('Akses Ditolak! Anda bukan pemilik produk untuk pesanan ini.');
    }

    order.status = 'completed';
    return await this.ordersRepository.save(order);
  }

  /**
   * Mengambil jumlah riwayat pesanan yang sudah selesai
   */
  async getCompletedOrdersCount(sellerId: string): Promise<{ completedCount: number }> {
    const completedCount = await this.ordersRepository.count({
      where: {
        status: 'completed',
        product: {
          seller: {
            id: sellerId,
          },
        },
      },
    });

    return { completedCount };
  }

  async seedCatalogData(): Promise<void> {
    // Implementasi manual jika diperlukan
  }
}