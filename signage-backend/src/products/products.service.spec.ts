import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UserEntity } from '../entities/user.entity';
import { ProductRatingEntity } from '../entities/product-rating.entity';
import { OrderEntity } from '../entities/order.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<ProductEntity>;
  let orderRepository: Repository<OrderEntity>;

  // Mock data yang sudah disesuaikan dengan relasi
  const mockSeller = { id: 'user-uuid-123', username: 'Ayu' } as UserEntity;

  const mockProduct: ProductEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Salad Sayur Segar Bu Ayu',
    description: 'Salad segar dari hasil panen kebun sendiri',
    label: 'Sayuran',
    category: 'Masakan',
    price: 10000,
    seller: mockSeller, // ✅ Diubah dari sellerName ke objek seller
    location: 'Desa Cipageran',
    mapsLink: 'https://maps.google.com/?q=Desa+Cipageran',
    whatsappLink: 'https://wa.me/6281234567890',
    rating: 5.0,
    reviewCount: 150,
    stock: 50,
    imageUrl: 'http://localhost:3000/uploads/products/test.jpg',
    benefits: 'Kaya Serat, Tinggi Vitamin C',
    suitableFor: 'Anak, Orang Tua, Diet',
    caution: 'Cuci bersih sebelum dimakan',
    caloriesValue: 85,
    proteinValue: 2.5,
    fatValue: 0.5,
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createProductDto: CreateProductDto = {
    name: 'Salad Sayur Segar Bu Ayu',
    description: 'Salad segar dari hasil panen kebun sendiri',
    label: 'Sayuran',
    category: 'Masakan',
    price: 10000,
    sellerId: 'user-uuid-123', // ✅ Diubah dari sellerName ke sellerId
    location: 'Desa Cipageran',
    stock: 50,
    benefits: 'Kaya Serat, Tinggi Vitamin C',
    suitableFor: 'Anak, Orang Tua, Diet',
    caution: 'Cuci bersih sebelum dimakan',
    caloriesValue: 85,
    proteinValue: 2.5,
    fatValue: 0.5,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductRatingEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    orderRepository = module.get<Repository<OrderEntity>>(getRepositoryToken(OrderEntity));
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockProduct);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      // ✅ Cek apakah repository.create dipanggil dengan objek seller yang benar
      expect(repository.create).toHaveBeenCalledWith({
        ...createProductDto,
        seller: { id: createProductDto.sellerId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all products with seller join', async () => {
      const mockProducts = [mockProduct];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(), // ✅ Tambahkan mock join
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('product.seller', 'seller');
    });
  });

  describe('findOne', () => {
    it('should return a product with relations', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        relations: ['seller'], // ✅ Pastikan relations dicek
      });
    });
  });

  describe('createOrder', () => {
    it('should place an order successfully and decrease product stock', async () => {
      const mockOrder = {
        id: 'order-uuid-123',
        product_name: mockProduct.name,
        qty: 2,
        buyer_name: 'testuser',
        address: 'Jl. Merdeka No. 10',
        product: mockProduct,
        buyer: { id: 'buyer-uuid', username: 'testuser' } as UserEntity,
      };

      const mockBuyer = { id: 'buyer-uuid', username: 'testuser' } as UserEntity;
      const createOrderDto = { qty: 2, address: 'Jl. Merdeka No. 10' };

      // Reset mockProduct stock
      mockProduct.stock = 50;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
      const productSaveSpy = jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockProduct,
        stock: mockProduct.stock - 2,
      });

      jest.spyOn(orderRepository, 'create').mockReturnValue(mockOrder as any);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(mockOrder as any);

      const result = await service.createOrder(mockProduct.id, mockBuyer, createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(productSaveSpy).toHaveBeenCalled();
      expect(mockProduct.stock).toBe(48); // 50 - 2
    });

    it('should throw BadRequestException if product is unavailable', async () => {
      const unavailableProduct = { ...mockProduct, status: 'unavailable' };
      jest.spyOn(service, 'findOne').mockResolvedValue(unavailableProduct);
      const mockBuyer = { id: 'buyer-uuid', username: 'testuser' } as UserEntity;

      await expect(
        service.createOrder(unavailableProduct.id, mockBuyer, { qty: 2, address: 'Jl. Merdeka No. 10' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const outOfStockProduct = { ...mockProduct, stock: 1 };
      jest.spyOn(service, 'findOne').mockResolvedValue(outOfStockProduct);
      const mockBuyer = { id: 'buyer-uuid', username: 'testuser' } as UserEntity;

      await expect(
        service.createOrder(outOfStockProduct.id, mockBuyer, { qty: 2, address: 'Jl. Merdeka No. 10' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSellerOrders', () => {
    it('should return all orders for a seller', async () => {
      const mockOrders = [
        {
          id: 'order-uuid',
          product_name: mockProduct.name,
          qty: 1,
          buyer_name: 'buyer',
          status: 'pending',
        },
      ];
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getSellerOrders(mockSeller.id);

      expect(result).toEqual(mockOrders);
      expect(orderRepository.find).toHaveBeenCalled();
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully if user is the seller', async () => {
      const mockOrder = {
        id: 'order-uuid',
        product_name: mockProduct.name,
        qty: 1,
        buyer_name: 'buyer',
        status: 'pending',
        product: mockProduct,
      };

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder as any);
      const saveSpy = jest.spyOn(orderRepository, 'save').mockResolvedValue({
        ...mockOrder,
        status: 'completed',
      } as any);

      const result = await service.completeOrder('order-uuid', mockSeller.id);

      expect(result.status).toBe('completed');
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the seller of the product', async () => {
      const mockOrder = {
        id: 'order-uuid',
        product_name: mockProduct.name,
        qty: 1,
        buyer_name: 'buyer',
        status: 'pending',
        product: mockProduct,
      };

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder as any);

      await expect(
        service.completeOrder('order-uuid', 'wrong-seller-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.completeOrder('non-existent-order', mockSeller.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCompletedOrdersCount', () => {
    it('should return completed orders count for a seller', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(5);

      const result = await service.getCompletedOrdersCount(mockSeller.id);

      expect(result).toEqual({ completedCount: 5 });
      expect(orderRepository.count).toHaveBeenCalled();
    });
  });
});