import { 
  Controller, Get, Post, Body, Param, 
  UseInterceptors, UploadedFile, BadRequestException, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngredientsService } from './ingredients.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * ENDPOINT BARU: Upload gambar langsung untuk diidentifikasi AI Python
   * Menghasilkan detail gizi lengkap dari Ingredient terkait
   */
  @Post('scan')
  @ApiOperation({ summary: 'Upload gambar bahan pangan untuk discan AI dan diambil info gizinya' })
  @ApiConsumes('multipart/form-data') // Membuka gerbang upload file di Swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { // Key wajib bernama 'image' saat upload file
          type: 'string',
          format: 'binary', // Memancing Swagger memunculkan tombol Choose File
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          cb(new BadRequestException('Hanya file gambar (jpg/jpeg/png/webp) yang diperbolehkan'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file dinaikkan ke 5MB agar aman dari kamera HP
    }),
  )
  async uploadAndScanImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File gambar wajib diunggah');
    }
    // Oper file gambar ke service untuk ditembak langsung ke Python Railway
    return await this.ingredientsService.scanImageWithAi(file);
  }

  @Get('scan/:label')
  @ApiOperation({ summary: 'Mencari data gizi berdasarkan label hasil scan AI' })
  async scanIngredient(@Param('label') label: string) {
    return await this.ingredientsService.findByLabel(label);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tambah master bahan pangan baru dengan Upload Gambar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createIngredientDto: CreateIngredientDto
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      createIngredientDto.imageUrl = uploadResult.secure_url;
    }

    return await this.ingredientsService.create(createIngredientDto);
  }

  @Post('seed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mengisi data awal telur dan ikan secara otomatis' })
  async seedData() {
    return await this.ingredientsService.seed();
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua daftar bahan pangan' })
  async findAll() {
    return await this.ingredientsService.findAll();
  }
}