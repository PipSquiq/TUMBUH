import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientEntity } from 'src/entities/ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepository: Repository<IngredientEntity>,
  ) {}

  async findByLabel(label: string): Promise<IngredientEntity> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { name: label },
    });

    if (!ingredient) {
      throw new NotFoundException(`Bahan pangan dengan label '${label}' belum terdaftar.`);
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
        imageUrl: 'https://res.cloudinary.com/dxbimn2hf/image/upload/v1/seeds/egg.png', // Contoh URL Cloudinary
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