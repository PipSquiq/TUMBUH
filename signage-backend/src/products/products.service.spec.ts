import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UserEntity } from '../entities/user.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<ProductEntity>;

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
  };

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
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
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
});