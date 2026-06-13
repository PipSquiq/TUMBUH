import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(VideoEntity)
    private videosRepository: Repository<VideoEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<VideoEntity> {
    const video = this.videosRepository.create(createVideoDto);
    return await this.videosRepository.save(video);
  }

  async findAll(category?: string, search?: string): Promise<VideoEntity[]> {
    const query = this.videosRepository.createQueryBuilder('video');

    // Filter berdasarkan kategori
    if (category && category !== 'Semua') {
      query.where('video.category = :category', { category });
    }

    // Filter berdasarkan search (title atau summary)
    if (search) {
      if (category && category !== 'Semua') {
        query.andWhere(
          '(video.title ILIKE :search OR video.summary ILIKE :search OR video.description ILIKE :search)',
          { search: `%${search}%` },
        );
      } else {
        query.where(
          '(video.title ILIKE :search OR video.summary ILIKE :search OR video.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }
    }

    // Urutkan berdasarkan views terbanyak dan dibuat terbaru
    query.orderBy('video.views', 'DESC');
    query.addOrderBy('video.createdAt', 'DESC');

    return await query.getMany();
  }

  async findByCategory(category: string): Promise<VideoEntity[]> {
    if (category === 'Semua') {
      return await this.videosRepository.find({
        order: { views: 'DESC', createdAt: 'DESC' },
      });
    }

    return await this.videosRepository.find({
      where: { category },
      order: { views: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<VideoEntity> {
    const video = await this.videosRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video dengan ID ${id} tidak ditemukan`);
    }
    return video;
  }

  async update(
    id: string,
    updateVideoDto: Partial<CreateVideoDto>,
  ): Promise<VideoEntity> {
    await this.videosRepository.update(id, updateVideoDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.videosRepository.delete(id);
  }

  // Fungsi untuk seed data video
  async seedVideoData(): Promise<void> {
    const existingVideos = await this.videosRepository.count();

    if (existingVideos > 0) {
      console.log('Data video sudah ada, skip seeding');
      return;
    }

    const videoData = [
      {
        title: 'Mengenal Gizi Seimbang',
        description: 'Pengenalan dasar gizi seimbang untuk hidup sehat',
        summary:
          'Video ini menjelaskan konsep gizi seimbang secara detail. Gizi seimbang adalah kombinasi yang tepat dari berbagai zat gizi yang diperlukan tubuh. Dalam video ini Anda akan mempelajari:\n\n1. Pengertian Gizi Seimbang\nGizi seimbang adalah asupan makanan yang mengandung zat-zat gizi dalam jumlah dan proporsi yang sesuai dengan kebutuhan tubuh.\n\n2. Empat Pilar Gizi Seimbang\n- Mengkonsumsi aneka ragam makanan\n- Membiasakan perilaku hidup bersih\n- Melakukan aktivitas fisik\n- Menjaga berat badan ideal\n\n3. Kelompok Zat Gizi\n- Karbohidrat (energi)\n- Protein (pertumbuhan)\n- Lemak (energi dan penyerapan vitamin)\n- Vitamin dan Mineral (kesehatan)\n- Air (hidrasi)\n\n4. Pedoman Piring Sehat\nGambar visual yang menunjukkan proporsi ideal makanan dalam satu porsi makan.',
        authorName: 'Dr. Rizal',
        youtubeUrl: 'https://www.youtube.com/watch?v=nutrition101',
        category: 'Edukasi',
        duration: 1800,
        durationText: '30 Menit',
        thumbnailUrl: 'https://via.placeholder.com/400x225?text=Gizi+Seimbang',
        views: 5250,
        externalLinks: [
          {
            title: 'Panduan Gizi Seimbang Kemenkes RI',
            url: 'https://www.kemkes.go.id/article/view/19073/panduan-gizi-seimbang/',
          },
          {
            title: 'Artikel: Pentingnya Gizi Seimbang',
            url: 'https://www.example.com/gizi-seimbang',
          },
          {
            title: 'Kalkulator Kebutuhan Kalori',
            url: 'https://www.example.com/kalkulator-kalori',
          },
        ],
        status: 'active',
      },
      {
        title: 'Resep Salad Sayur Sehat',
        description: 'Tutorial membuat salad sayur yang lezat dan bergizi',
        summary:
          'Pelajari cara membuat salad sayur yang tidak hanya lezat namun juga bergizi tinggi. Salad adalah pilihan makanan yang sempurna untuk menjaga kesehatan dan berat badan ideal.\n\nDalam video ini akan kami jelaskan:\n\n1. Pemilihan Bahan-bahan Segar\n- Sayuran yang cocok untuk salad\n- Cara memilih sayuran yang segar\n\n2. Persiapan Bahan\n- Cara mencuci sayuran dengan benar\n- Teknik pemotongan yang tepat\n\n3. Resep Dressing Sehat\n- Dressing yogurt rendah lemak\n- Dressing minyak zaitun dan lemon\n\n4. Tips & Trik\n- Cara menyimpan salad agar tetap segar\n- Variasi bahan untuk menghindari kebosanan',
        authorName: 'Muhammad Rizky',
        youtubeUrl: 'https://www.youtube.com/watch?v=salad-recipe',
        category: 'Tutorial',
        duration: 900,
        durationText: '15 Menit',
        thumbnailUrl: 'https://via.placeholder.com/400x225?text=Resep+Salad',
        views: 3420,
        externalLinks: [
          {
            title: 'Resep Lengkap Salad',
            url: 'https://www.example.com/resep-salad',
          },
          {
            title: 'Daftar Belanja Salad',
            url: 'https://www.example.com/daftar-belanja',
          },
        ],
        status: 'active',
      },
      {
        title: 'Tips Masak Sehat di Rumah',
        description: 'Tips dan trik memasak makanan sehat dengan mudah',
        summary:
          'Masakan rumahan yang sehat tidak harus ribet! Video ini memberikan tips dan trik praktis untuk memasak makanan bergizi tinggi di dapur Anda sendiri.\n\nMateri yang dibahas:\n\n1. Teknik Memasak Sehat\n- Memasak dengan minyak minimal\n- Mengurangi garam dan gula\n- Mempertahankan nutrisi saat memasak\n\n2. Peralatan Dapur\n- Pemilihan peralatan yang tepat\n- Oven, steamer, air fryer vs menggoreng\n\n3. Bahan Pengganti\n- Pengganti mentega dengan minyak sehat\n- Pengganti gula dengan stevia\n- Pengganti garam dengan rempah-rempah\n\n4. Menu Mingguan Sehat\n- Perencanaan menu yang praktis\n- Meal prep untuk efisiensi waktu\n- Budget-friendly healthy cooking',
        authorName: 'Riska',
        youtubeUrl: 'https://www.youtube.com/watch?v=tips-masak-sehat',
        category: 'Tutorial',
        duration: 600,
        durationText: '10 Menit',
        thumbnailUrl: 'https://via.placeholder.com/400x225?text=Tips+Masak+Sehat',
        views: 2890,
        externalLinks: [
          {
            title: 'Panduan Masak Sehat',
            url: 'https://www.example.com/panduan-masak',
          },
          {
            title: 'Resep Sehat Mingguan',
            url: 'https://www.example.com/menu-mingguan',
          },
        ],
        status: 'active',
      },
      {
        title: 'Cara Berkebun Organik di Rumah',
        description: 'Panduan lengkap berkebun organik untuk pemula',
        summary:
          'Ingin memiliki sayuran segar sendiri di rumah? Video ini akan memandu Anda langkah demi langkah untuk memulai berkebun organik.\n\nTopik yang dicover:\n\n1. Persiapan Awal\n- Pemilihan lokasi yang tepat\n- Persiapan lahan atau pot\n- Kebutuhan cahaya matahari\n\n2. Pemilihan Tanaman\n- Tanaman yang mudah untuk pemula\n- Musim tanam yang tepat\n\n3. Perawatan Tanaman\n- Penyiraman yang tepat\n- Pengendalian hama alami\n- Pemupukan organik\n\n4. Panen dan Penyimpanan\n- Waktu yang tepat untuk panen\n- Cara menyimpan hasil panen',
        authorName: 'Dr. Rizal',
        youtubeUrl: 'https://www.youtube.com/watch?v=berkebun-organik',
        category: 'Tanam',
        duration: 2400,
        durationText: '40 Menit',
        thumbnailUrl: 'https://via.placeholder.com/400x225?text=Berkebun+Organik',
        views: 4120,
        externalLinks: [
          {
            title: 'Panduan Berkebun Organik',
            url: 'https://www.example.com/berkebun-organik',
          },
          {
            title: 'Toko Benih Organik',
            url: 'https://www.example.com/toko-benih',
          },
        ],
        status: 'active',
      },
    ];

    for (const data of videoData) {
      const video = this.videosRepository.create(data);
      await this.videosRepository.save(video);
    }

    console.log('Data video berhasil di-seed!');
  }

  async toggleLike(videoId: string, user: UserEntity): Promise<{ liked: boolean }> {
    const video = await this.findOne(videoId);
    const userWithLikes = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['likedVideos'],
    });

    if (!userWithLikes) {
      throw new NotFoundException(`User dengan ID ${user.id} tidak ditemukan`);
    }

    const isLiked = userWithLikes.likedVideos.some((v) => v.id === video.id);

    if (isLiked) {
      userWithLikes.likedVideos = userWithLikes.likedVideos.filter((v) => v.id !== video.id);
    } else {
      userWithLikes.likedVideos.push(video);
    }

    await this.usersRepository.save(userWithLikes);
    return { liked: !isLiked };
  }

  async findLikedByUser(user: UserEntity): Promise<VideoEntity[]> {
    const userWithLikes = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['likedVideos'],
    });
    return userWithLikes?.likedVideos || [];
  }
}