import { Controller, Post, Get, Body, Param, Put, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiQuery, ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoEntity } from '../entities/video.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../entities/user.entity';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto): Promise<VideoEntity> {
    return await this.videosService.create(createVideoDto);
  }

  @Post('seed')
  async seedData(): Promise<{ message: string }> {
    await this.videosService.seedVideoData();
    return { message: 'Data video berhasil di-seed!' };
  }

  @Get()
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter video berdasarkan kategori (Semua, Tutorial, Edukasi, Tanam)',
    example: 'Edukasi',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Cari video berdasarkan judul atau ringkasan',
    example: 'gizi',
  })
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<VideoEntity[]> {
    return await this.videosService.findAll(category, search);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string): Promise<VideoEntity[]> {
    return await this.videosService.findByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('liked/me')
  @ApiOperation({ summary: 'Ambil daftar video yang disukai user aktif' })
  async getLikedVideos(@Req() req: { user: UserEntity }): Promise<VideoEntity[]> {
    return await this.videosService.findLikedByUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  @ApiOperation({ summary: 'Like/Unlike video' })
  async toggleLike(
    @Param('id') id: string,
    @Req() req: { user: UserEntity },
  ): Promise<{ liked: boolean }> {
    return await this.videosService.toggleLike(id, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VideoEntity> {
    return await this.videosService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVideoDto: Partial<CreateVideoDto>,
  ): Promise<VideoEntity> {
    return await this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.videosService.remove(id);
  }
}