import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientEntity } from 'src/entities/ingredient.entity';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepository: Repository<IngredientEntity>,
  ) {}

  /**
   * Logika menjembatani File Gambar dari FE -> Python Railway -> Cocokkan ke DB Postgres
   */
  async scanImageWithAi(file: Express.Multer.File): Promise<IngredientEntity> {
    const aiServerUrl = 'https://refreshing-growth-production-ae90.up.railway.app/predict';

    try {
      // 1. Bungkus file buffer dari NestJS ke format FormData Python
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      // 2. Tembak endpoint AI Python di Railway
      const response = await axios.post(aiServerUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const { prediction } = response.data;

      // 3. Tangani jika AI mengembalikan respons gagal deteksi
      if (prediction === 'Bahan pangan tidak dikenali') {
        throw new HttpException(
          'Bahan pangan tidak dikenali oleh AI. Coba posisikan kamera lebih dekat.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. Lempar nama label hasil prediksi AI (e.g. 'TELOR', 'IKAN') ke pencarian database
      return await this.findByLabel(prediction);

    } catch (error: any) {
      if (error instanceof HttpException || error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Gagal memproses gambar di server AI: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByLabel(label: string): Promise<IngredientEntity> {
    const searchName = label.toLowerCase();
    
    // Mapping label dari AI ke nama bahan di database jika ada perbedaan kata/ejaan
    const labelMapping: Record<string, string> = {
      'telor': 'telur',
    };
    
    const targetName = labelMapping[searchName] || searchName;

    // 1. Cari kecocokan sama persis (case-insensitive) terlebih dahulu
    let ingredient = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(ingredient.name) = :targetName', { targetName })
      .getOne();

    // 2. Jika tidak ada yang sama persis, cari dengan ILIKE dan filter secara pintar di memori
    if (!ingredient) {
      const candidates = await this.ingredientRepository
        .createQueryBuilder('ingredient')
        .where('ingredient.name ILIKE :pattern', { pattern: `%${targetName}%` })
        .getMany();

      if (candidates.length > 0) {
        // Cari yang nama bahannya mengandung kata utuh (word boundary), 
        // misalnya "Dada Ayam" mengandung kata "ayam", tapi "Bayam" tidak mengandung kata "ayam" sebagai kata utuh.
        const wordRegex = new RegExp(`\\b${targetName}\\b`, 'i');
        const bestMatch = candidates.find(c => wordRegex.test(c.name));
        
        ingredient = bestMatch || candidates[0];
      }
    }

    if (!ingredient) {
      throw new NotFoundException(
        `Bahan pangan dengan label '${label}' berhasil dideteksi AI, namun rincian gizinya belum ada di database.`,
      );
    }
    return ingredient;
  }

  async findAll() {
    return await this.ingredientRepository.find();
  }

  async create(data: Partial<IngredientEntity>) {
    const newIngredient = this.ingredientRepository.create(data);
    return await this.ingredientRepository.save(newIngredient);
  }

  async seed() {
    const data = [
      {
        name: 'telur',
        imageUrl: 'https://res.cloudinary.com/dxbimn2hf/image/upload/v1/seeds/egg.png',
        caloriesValue: 155,
        proteinValue: 13.0,
        kalsium: 50,
        calorieLevel: 'Kalori Sedang',
        proteinLevel: 'Protein Tinggi',
        vitaminLevel: 'Vitamin Cukup',
        highlights: ['Sumber Protein Alami', 'Kaya Kolin', 'Mudah Diolah'],
        suitableFor: 'Anak, Orang Tua, Olahragawan',
        attention: 'Simpan di suhu sejuk dan pastikan cangkang tidak retak.'
      },
      {
        name: 'ikan',
        imageUrl: 'https://res.cloudinary.com/dxbimn2hf/image/upload/v1/seeds/fish.png',
        caloriesValue: 110,
        proteinValue: 20.0,
        kalsium: 150,
        calorieLevel: 'Kalori Rendah',
        proteinLevel: 'Protein Tinggi',
        vitaminLevel: 'Vitamin Tinggi',
        highlights: ['Tinggi Protein', 'Kaya Vitamin B12', 'Tinggi Omega', 'Kaya Zat Besi'],
        suitableFor: 'Anak, Orang Tua, Diet',
        attention: 'Cuci Bersih Sebelum di masak'
      }
    ];

    for (const item of data) {
      const exist = await this.ingredientRepository.findOne({ where: { name: item.name } });
      if (!exist) {
        await this.ingredientRepository.save(this.ingredientRepository.create(item));
      }
    }
    return { message: 'Seeding Berhasil!' };
  }
}