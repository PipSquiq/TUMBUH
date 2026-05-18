import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Judul video',
    example: 'Mengenal Gizi Seimbang',
  })
  title: string;

  @ApiProperty({
    description: 'Deskripsi singkat video',
    example: 'Pengenalan dasar gizi seimbang untuk hidup sehat',
  })
  description: string;

  @ApiProperty({
    description: 'Ringkasan/summary lengkap video untuk halaman detail',
    example:
      'Video ini menjelaskan konsep gizi seimbang secara detail. Gizi seimbang adalah...',
  })
  summary: string;

  @ApiProperty({
    description: 'Nama pembuat/channel video',
    example: 'Dr. Rizal',
  })
  authorName: string;

  @ApiProperty({
    description: 'URL YouTube video',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  youtubeUrl: string;

  @ApiProperty({
    description: 'Kategori video (Tutorial, Edukasi, Tanam, dll)',
    example: 'Edukasi',
  })
  category: string;

  @ApiProperty({
    description: 'Durasi video dalam detik',
    example: 1800,
  })
  duration: number;

  @ApiProperty({
    description: 'Durasi dalam format text untuk UI (misal: "30 Menit")',
    example: '30 Menit',
  })
  durationText: string;

  @ApiProperty({
    description: 'URL gambar thumbnail video',
    example: 'https://example.com/thumbnails/gizi-seimbang.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description:
      'Link tambahan (JSON array berisi {title: string, url: string})',
    example: [
      { title: 'Baca Lebih Lanjut', url: 'https://example.com/gizi' },
    ],
    required: false,
  })
  externalLinks?: Array<{ title: string; url: string }>;

  @ApiProperty({
    description: 'Status video (active/inactive)',
    example: 'active',
    required: false,
    default: 'active',
  })
  status?: string;
}