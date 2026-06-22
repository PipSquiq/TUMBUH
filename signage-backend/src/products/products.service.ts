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
import { SellerPaymentEntity } from '../entities/seller-payment.entity';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,

    @InjectRepository(ProductRatingEntity)
    private ratingsRepository: Repository<ProductRatingEntity>,

    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,

    @InjectRepository(SellerPaymentEntity)
    private sellerPaymentsRepository: Repository<SellerPaymentEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  // =============================================
  // SELLER REGISTRATION & MANAGEMENT
  // =============================================

  /**
   * Daftar sebagai penjual dengan data pembayaran
   */
  async registerAsSeller(userId: string, dto: RegisterSellerDto): Promise<{ message: string; isSeller: boolean; paymentMethods: SellerPaymentEntity[] }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.isSeller) {
      const paymentCount = await this.sellerPaymentsRepository.count({
        where: { user: { id: userId } },
      });
      if (paymentCount > 0) {
        throw new BadRequestException('Anda sudah terdaftar sebagai penjual');
      }
    }

    // Simpan metode pembayaran
    const paymentEntities: SellerPaymentEntity[] = [];
    for (const pm of dto.paymentMethods) {
      const payment = this.sellerPaymentsRepository.create({
        type: pm.type,
        provider: pm.provider || null,
        accountNumber: pm.accountNumber || null,
        accountName: pm.accountName || null,
        qrisImage: pm.qrisImage || null,
        user: { id: userId } as UserEntity,
      } as Partial<SellerPaymentEntity>);
      const saved = await this.sellerPaymentsRepository.save(payment as SellerPaymentEntity);
      paymentEntities.push(saved as SellerPaymentEntity);
    }

    // Set user sebagai penjual
    user.isSeller = true;
    await this.usersRepository.save(user);

    return {
      message: 'Berhasil terdaftar sebagai penjual!',
      isSeller: true,
      paymentMethods: paymentEntities,
    };
  }

  /**
   * Cek status penjual dan data pembayaran
   */
  async getSellerStatus(userId: string): Promise<{ isSeller: boolean; paymentMethods: SellerPaymentEntity[] }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['sellerPayments'],
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      isSeller: user.isSeller,
      paymentMethods: user.sellerPayments || [],
    };
  }

  /**
   * Ambil daftar metode pembayaran penjual
   */
  async getSellerPayments(userId: string): Promise<SellerPaymentEntity[]> {
    return await this.sellerPaymentsRepository.find({
      where: { user: { id: userId } },
    });
  }

  /**
   * Update metode pembayaran penjual (hapus semua lalu buat ulang)
   */
  async updateSellerPayments(userId: string, dto: RegisterSellerDto): Promise<{ message: string; paymentMethods: SellerPaymentEntity[] }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    if (!user.isSeller) {
      throw new ForbiddenException('Anda belum terdaftar sebagai penjual');
    }

    // Hapus semua pembayaran lama
    await this.sellerPaymentsRepository.delete({ user: { id: userId } });

    // Simpan pembayaran baru
    const paymentEntities: SellerPaymentEntity[] = [];
    for (const pm of dto.paymentMethods) {
      const payment = this.sellerPaymentsRepository.create({
        type: pm.type,
        provider: pm.provider || null,
        accountNumber: pm.accountNumber || null,
        accountName: pm.accountName || null,
        qrisImage: pm.qrisImage || null,
        user: { id: userId } as UserEntity,
      } as Partial<SellerPaymentEntity>);
      const saved = await this.sellerPaymentsRepository.save(payment as SellerPaymentEntity);
      paymentEntities.push(saved as SellerPaymentEntity);
    }

    return {
      message: 'Metode pembayaran berhasil diperbarui!',
      paymentMethods: paymentEntities,
    };
  }

  /**
   * Mencabut status penjual (deactivate seller)
   * Hanya bisa jika tidak ada pesanan pending
   */
  async deactivateSeller(userId: string): Promise<{ message: string; isSeller: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    if (!user.isSeller) {
      throw new BadRequestException('Anda belum terdaftar sebagai penjual');
    }

    // Cek apakah masih ada pesanan pending
    const pendingOrders = await this.ordersRepository.count({
      where: {
        status: 'pending',
        product: {
          seller: { id: userId },
        },
      },
    });

    if (pendingOrders > 0) {
      throw new BadRequestException(
        `Tidak dapat mencabut status penjual. Masih ada ${pendingOrders} pesanan yang belum diselesaikan.`
      );
    }

    // Hapus semua metode pembayaran
    await this.sellerPaymentsRepository.delete({ user: { id: userId } });

    // Set isSeller = false
    user.isSeller = false;
    await this.usersRepository.save(user);

    return {
      message: 'Status penjual berhasil dicabut.',
      isSeller: false,
    };
  }

  // =============================================
  // PRODUCT CRUD
  // =============================================

  /**
   * Create Product
   * Seller ID otomatis diambil dari User yang sedang login
   * Hanya user yang sudah terdaftar penjual yang boleh buat produk
   */
  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const { sellerId, ...productData } = createProductDto;

    // Validasi: hanya penjual terdaftar yang boleh buat produk
    const seller = await this.usersRepository.findOne({ where: { id: sellerId } });
    if (!seller || !seller.isSeller) {
      throw new ForbiddenException('Anda harus terdaftar sebagai penjual untuk menambahkan produk. Silakan daftar sebagai penjual terlebih dahulu.');
    }

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
      relations: ['seller', 'seller.sellerPayments'], 
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
    
    // Auto-update status based on stock
    if (product.stock > 0) {
      product.status = 'available';
    } else {
      product.status = 'unavailable';
    }
    
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
   * Penjual TIDAK boleh membeli produk miliknya sendiri
   */
  async createOrder(
    productId: string,
    user: UserEntity,
    createOrderDto: CreateOrderDto,
    paymentProofUrl?: string,
  ): Promise<OrderEntity> {
    const product = await this.findOne(productId);
    console.log(`[createOrder] Found product: ${product.name} (${product.id}), Seller: ${product.seller?.id}, Buyer: ${user.id}`);

    // Validasi: penjual tidak boleh membeli produk miliknya sendiri
    if (product.seller && product.seller.id === user.id) {
      throw new BadRequestException('Anda tidak dapat membeli produk milik Anda sendiri.');
    }

    if (product.status === 'unavailable') {
      if (product.stock > 0) {
        product.status = 'available';
        await this.productsRepository.save(product);
      } else {
        throw new BadRequestException('Produk tidak tersedia untuk dipesan');
      }
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
    const order = this.ordersRepository.create();
    order.product_name = product.name;
    order.qty = createOrderDto.qty;
    order.buyer_name = user.username;
    order.address = createOrderDto.address;
    order.payment_method = createOrderDto.payment_method || null;
    order.payment_proof = paymentProofUrl || null;
    order.payment_status = paymentProofUrl ? 'waiting' : 'unpaid';
    order.status = 'pending';
    order.product = product;
    order.buyer = user;

    const savedOrder = await this.ordersRepository.save(order);
    console.log(`[createOrder] Saved order: ${savedOrder.id}, Status: ${savedOrder.status}`);
    const orderWithRelations = await this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: [
        'product',
        'product.seller',
        'product.seller.sellerPayments',
        'buyer',
      ],
    });
    if (!orderWithRelations) {
      throw new NotFoundException('Gagal memuat pesanan setelah dibuat.');
    }
    return orderWithRelations;
  }

  /**
   * Mengambil semua pesanan masuk untuk produk-produk milik penjual
   */
  async getSellerOrders(sellerId: string): Promise<OrderEntity[]> {
    console.log(`[getSellerOrders] Fetching orders for sellerId: ${sellerId}`);
    // Sinkronisasi data lama yang berstatus null menjadi 'pending'
    const updateResult = await this.ordersRepository.update({ status: IsNull() }, { status: 'pending' });
    console.log(`[getSellerOrders] Sync null status count: ${updateResult.affected}`);

    const orders = await this.ordersRepository.find({
      where: {
        product: {
          seller: {
            id: sellerId,
          },
        },
      },
      relations: ['product', 'product.seller', 'buyer'],
      order: {
        createdAt: 'DESC',
      },
    });

    console.log(`[getSellerOrders] Found ${orders.length} orders for sellerId: ${sellerId}`);
    orders.forEach(o => {
      console.log(`- Order ID: ${o.id}, Product: ${o.product?.name}, Buyer: ${o.buyer_name}, Status: ${o.status}`);
    });

    return orders;
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

    if (order.status === 'rejected') {
      throw new BadRequestException('Pesanan yang sudah ditolak tidak dapat diselesaikan');
    }

    order.status = 'completed';
    if (order.payment_method && order.payment_method.toUpperCase() === 'COD') {
      order.payment_status = 'verified';
    }
    return await this.ordersRepository.save(order);
  }

  /**
   * Menolak/membatalkan pesanan dan mengembalikan stok produk
   */
  async rejectOrder(orderId: string, sellerId: string): Promise<OrderEntity> {
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

    if (order.status === 'completed') {
      throw new BadRequestException('Pesanan yang sudah selesai tidak dapat ditolak');
    }

    if (order.status === 'rejected') {
      throw new BadRequestException('Pesanan sudah ditolak');
    }

    order.status = 'rejected';
    order.payment_status = 'rejected';

    // Kembalikan stok produk jika produk masih ada
    if (order.product) {
      order.product.stock += order.qty;
      if (order.product.stock > 0 && order.product.status === 'unavailable') {
        order.product.status = 'available';
      }
      await this.productsRepository.save(order.product);
    }

    return await this.ordersRepository.save(order);
  }

  /**
   * Mengunggah bukti pembayaran pembeli
   */
  async uploadPaymentProof(
    orderId: string,
    buyerId: string,
    secureUrl: string,
  ): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'product', 'product.seller', 'product.seller.sellerPayments'],
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (!order.buyer || order.buyer.id !== buyerId) {
      throw new ForbiddenException('Akses Ditolak! Anda bukan pembeli untuk pesanan ini.');
    }

    if (order.status === 'completed' || order.status === 'rejected') {
      throw new BadRequestException('Pesanan sudah selesai atau ditolak, tidak dapat mengunggah bukti pembayaran.');
    }

    order.payment_proof = secureUrl;
    order.payment_status = 'waiting';

    return await this.ordersRepository.save(order);
  }

  /**
   * Validasi bukti pembayaran oleh penjual
   */
  async validatePayment(
    orderId: string,
    sellerId: string,
    paymentStatus: 'verified' | 'rejected',
  ): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['product', 'product.seller', 'buyer'],
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (!order.product || !order.product.seller || order.product.seller.id !== sellerId) {
      throw new ForbiddenException('Akses Ditolak! Anda bukan pemilik produk untuk pesanan ini.');
    }

    if (order.status === 'completed' || order.status === 'rejected') {
      throw new BadRequestException('Status pesanan sudah selesai atau ditolak.');
    }

    order.payment_status = paymentStatus;

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
