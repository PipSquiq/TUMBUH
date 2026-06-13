import {
  Controller, Post, Get, Body, Param, Put, Delete, Patch,
  Query, UseInterceptors, UploadedFile, BadRequestException,
  UseGuards, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RateProductDto } from './dto/rate-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductEntity } from '../entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Memberikan rating bintang (1-5) - Toggle' })
  async rate(
    @Param('id') id: string,
    @Body() rateProductDto: RateProductDto,
    @Req() req: any,
  ) {
    return await this.productsService.rateProduct(id, req.user.id, rateProductDto.score);
  }

  @Post(':id/order')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Input pemesanan produk' })
  async createOrder(
    @Param('id') id: string,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: any,
  ) {
    return await this.productsService.createOrder(id, req.user, createOrderDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tambah produk baru' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Salad Sayur Segar' },
        description: { type: 'string', example: 'Deskripsi produk lengkap' },
        label: { type: 'string', example: 'Sayuran' },
        category: { type: 'string', example: 'Masakan' },
        price: { type: 'number', example: 15000 },
        stock: { type: 'number', example: 10 },
        location: { type: 'string', example: 'Desa Cipageran' },
        mapsLink: { type: 'string', example: 'https://maps.google.com/...' },
        whatsappLink: { type: 'string', example: 'https://wa.me/...' },
        benefits: { type: 'string', example: 'Menyehatkan' },
        suitableFor: { type: 'string' },
        caution: { type: 'string' },
        caloriesValue: { type: 'number' },
        proteinValue: { type: 'number' },
        fatValue: { type: 'number' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<ProductEntity> {
    createProductDto.sellerId = req.user.id;
    
    // Otomatisasi whatsappLink dari nomor telepon akun seller
    if (!createProductDto.whatsappLink || createProductDto.whatsappLink.trim() === '') {
      const phone = req.user.phoneNumber || '';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.substring(1)
        : (cleanPhone.startsWith('8') ? '62' + cleanPhone : cleanPhone);
      createProductDto.whatsappLink = `https://wa.me/${formattedPhone}`;
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      createProductDto.imageUrl = uploadResult.secure_url;
    }
    return await this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update data produk (Hanya Pemilik)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Pilih field yang ingin diubah. Kosongkan jika tidak ingin mengubah.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        label: { type: 'string' },
        category: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        location: { type: 'string' },
        mapsLink: { type: 'string' },
        whatsappLink: { type: 'string' },
        benefits: { type: 'string' },
        suitableFor: { type: 'string' },
        caution: { type: 'string' },
        caloriesValue: { type: 'number' },
        proteinValue: { type: 'number' },
        fatValue: { type: 'number' },
        status: { type: 'string', enum: ['available', 'unavailable'] },
        image: { type: 'string', format: 'binary', description: 'Opsional: Pilih gambar baru' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<ProductEntity> {
    // Otomatisasi/fallback whatsappLink dari nomor telepon akun seller jika kosong
    if (!updateProductDto.whatsappLink || updateProductDto.whatsappLink.trim() === '') {
      const phone = req.user.phoneNumber || '';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.substring(1)
        : (cleanPhone.startsWith('8') ? '62' + cleanPhone : cleanPhone);
      updateProductDto.whatsappLink = `https://wa.me/${formattedPhone}`;
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      updateProductDto.imageUrl = uploadResult.secure_url;
    }
    return await this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Hapus produk (Hanya Pemilik)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.productsService.remove(id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua produk' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query('category') category?: string, @Query('search') search?: string) {
    return await this.productsService.findAll(category, search);
  }

  @Get('seller/orders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Daftar semua pesanan masuk untuk produk penjual' })
  async getSellerOrders(@Req() req: any) {
    return await this.productsService.getSellerOrders(req.user.id);
  }

  @Get('seller/orders/completed-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Jumlah riwayat pesanan yang sudah selesai untuk penjual' })
  async getCompletedOrdersCount(@Req() req: any) {
    return await this.productsService.getCompletedOrdersCount(req.user.id);
  }

  @Patch('seller/orders/:orderId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validasi/selesaikan pesanan' })
  async completeOrder(
    @Param('orderId') orderId: string,
    @Req() req: any,
  ) {
    return await this.productsService.completeOrder(orderId, req.user.id);
  }

  @Get('random')
  @ApiOperation({ summary: 'Ambil 4 produk acak' })
  async findRandom() {
    return await this.productsService.findRandom();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail produk' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }
}