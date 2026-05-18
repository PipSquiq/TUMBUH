import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('videos')
export class VideoEntity {
  @ApiProperty({
    description: 'ID unik video menggunakan UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Judul video',
    example: 'Mengenal Gizi Seimbang',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Deskripsi singkat video',
    example: 'Pengenalan dasar gizi seimbang untuk hidup sehat',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Ringkasan/summary lengkap video untuk halaman detail',
    example:
      'Video ini menjelaskan konsep gizi seimbang secara detail termasuk...',
  })
  @Column({ type: 'text' })
  summary: string;

  @ApiProperty({
    description: 'Nama pembuat/channel video',
    example: 'Dr. Rizal',
  })
  @Column({ type: 'varchar', length: 100 })
  authorName: string;

  @ApiProperty({
    description: 'URL YouTube video',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @Column({ type: 'varchar', length: 255 })
  youtubeUrl: string;

  @ApiProperty({
    description: 'Kategori video (Tutorial, Edukasi, Tanam, dll)',
    example: 'Edukasi',
  })
  @Column({ type: 'varchar', length: 50 })
  category: string;

  @ApiProperty({
    description: 'Durasi video dalam detik',
    example: 1800,
  })
  @Column({ type: 'int' })
  duration: number;

  @ApiProperty({
    description: 'Durasi dalam format text untuk UI (misal: "30 Menit")',
    example: '30 Menit',
  })
  @Column({ type: 'varchar', length: 50 })
  durationText: string;

  @ApiProperty({
    description: 'URL gambar thumbnail video',
    example: 'https://example.com/thumbnails/gizi-seimbang.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl: string;

  @ApiProperty({
    description: 'Jumlah views video',
    example: 5250,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  views: number;

  @ApiProperty({
    description:
      'Link tambahan (JSON array berisi {title: string, url: string})',
    example:
      '[{"title": "Sumber 1", "url": "https://..."}, {"title": "Sumber 2", "url": "https://..."}]',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  externalLinks: Array<{ title: string; url: string }>;

  @ApiProperty({
    description: 'Status video (active/inactive)',
    example: 'active',
    default: 'active',
  })
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @ApiProperty({
    description: 'Waktu pembuatan video',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir video',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}