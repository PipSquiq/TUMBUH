import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoEntity } from '../entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';

describe('VideosService', () => {
  let service: VideosService;
  let repository: Repository<VideoEntity>;

  const mockVideo: VideoEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Mengenal Gizi Seimbang',
    description: 'Pengenalan dasar gizi seimbang untuk hidup sehat',
    summary: 'Video ini menjelaskan konsep gizi seimbang secara detail...',
    authorName: 'Dr. Rizal',
    youtubeUrl: 'https://www.youtube.com/watch?v=nutrition101',
    category: 'Edukasi',
    duration: 1800,
    durationText: '30 Menit',
    thumbnailUrl: 'https://via.placeholder.com/400x225?text=Gizi+Seimbang',
    views: 5250,
    externalLinks: [
      {
        title: 'Panduan Gizi Seimbang',
        url: 'https://www.example.com/gizi',
      },
    ],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createVideoDto: CreateVideoDto = {
    title: 'Mengenal Gizi Seimbang',
    description: 'Pengenalan dasar gizi seimbang untuk hidup sehat',
    summary: 'Video ini menjelaskan konsep gizi seimbang secara detail...',
    authorName: 'Dr. Rizal',
    youtubeUrl: 'https://www.youtube.com/watch?v=nutrition101',
    category: 'Edukasi',
    duration: 1800,
    durationText: '30 Menit',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: getRepositoryToken(VideoEntity),
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

    service = module.get<VideosService>(VideosService);
    repository = module.get<Repository<VideoEntity>>(
      getRepositoryToken(VideoEntity),
    );
  });

  describe('create', () => {
    it('should create a video successfully', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockVideo);
      jest.spyOn(repository, 'save').mockResolvedValue(mockVideo);

      const result = await service.create(createVideoDto);

      expect(result).toEqual(mockVideo);
      expect(repository.create).toHaveBeenCalledWith(createVideoDto);
    });
  });

  describe('findAll', () => {
    it('should return all videos', async () => {
      const mockVideos = [mockVideo];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVideos),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toEqual(mockVideos);
    });

    it('should filter videos by category', async () => {
      const mockVideos = [mockVideo];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVideos),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll('Edukasi');

      expect(result).toEqual(mockVideos);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a video by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockVideo);

      const result = await service.findOne(mockVideo.id);

      expect(result).toEqual(mockVideo);
    });

    it('should throw NotFoundException when video not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a video successfully', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockVideo.id);

      expect(repository.delete).toHaveBeenCalledWith(mockVideo.id);
    });
  });
});