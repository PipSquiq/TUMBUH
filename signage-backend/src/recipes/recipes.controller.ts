import {
  Controller, Post, Get, Body, Param, Put, Delete,
  UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeEntity } from '../entities/recipe.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah resep baru dengan upload gambar' })
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
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<RecipeEntity> {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      createRecipeDto.imageUrl = uploadResult.secure_url;
    }
    return await this.recipesService.create(createRecipeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resep dan gambar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateRecipeDto: Partial<CreateRecipeDto>,
  ): Promise<RecipeEntity> {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      updateRecipeDto.imageUrl = uploadResult.secure_url;
    }
    return await this.recipesService.update(id, updateRecipeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('liked/me')
  @ApiOperation({ summary: 'Ambil daftar resep yang disukai saya' })
  async getLikedRecipes(@Req() req: { user: UserEntity }): Promise<RecipeEntity[]> {
    return await this.recipesService.findLikedByUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @ApiOperation({ summary: 'Like/Unlike resep' })
  async toggleLike(
    @Param('id') id: string,
    @Req() req: { user: UserEntity },
  ): Promise<{ liked: boolean }> {
    return await this.recipesService.toggleLike(id, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua resep' })
  async findAll(): Promise<RecipeEntity[]> {
    return await this.recipesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail resep berdasarkan ID' })
  async findOne(@Param('id') id: string): Promise<RecipeEntity> {
    return await this.recipesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Hapus resep' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.recipesService.remove(id);
  }
}