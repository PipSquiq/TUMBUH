import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanEntity } from '../entities/scan.entity';
import { IngredientEntity } from '../entities/ingredient.entity';
import { CreateScanDto } from './dto/create-scan.dto';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(ScanEntity)
    private scansRepository: Repository<ScanEntity>,
    @InjectRepository(IngredientEntity)
    private ingredientsRepository: Repository<IngredientEntity>,
  ) {}

  async create(createScanDto: CreateScanDto): Promise<ScanEntity> {
    const { ingredientId, ...rest } = createScanDto;
    
    // Buat instance entity dari data sisa DTO
    const scan = this.scansRepository.create(rest);

    // Hubungkan relasi ke Ingredient jika ID disediakan
    if (ingredientId) {
      const ingredient = await this.ingredientsRepository.findOne({ where: { id: ingredientId } });
      if (ingredient) {
        scan.ingredient = ingredient;
      }
    }

    return await this.scansRepository.save(scan);
  }

  async findAll(): Promise<ScanEntity[]> {
    // Mengambil data scan beserta detail nutrisi dari ingredient terkait
    return await this.scansRepository.find({ relations: ['ingredient'] });
  }

  async findOne(id: string): Promise<ScanEntity> {
    const scan = await this.scansRepository.findOne({ 
      where: { id },
      relations: ['ingredient'] 
    });
    
    if (!scan) {
      throw new NotFoundException(`Scan dengan ID ${id} tidak ditemukan`);
    }
    return scan;
  }

  /**
   * Proses scan bahan pangan berdasarkan label yang terdeteksi AI
   */
  async processScanByLabel(
    detectedLabel: string,
    confidenceScore: number,
  ): Promise<ScanEntity> {
    // 1. Cari Ingredient yang namanya mirip dengan label hasil scan (e.g., "Ikan")
    const ingredient = await this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.name ILIKE :label', { label: `%${detectedLabel}%` })
      .getOne();

    if (!ingredient) {
      throw new NotFoundException(
        `Bahan pangan "${detectedLabel}" belum terdaftar di database kami.`,
      );
    }

    // 2. Siapkan data scan baru menyelaraskan DTO dengan Entity baru
    const scanData: CreateScanDto = {
      detectedLabel,
      confidenceScore,
      ingredientId: ingredient.id,
      ringkasan: `Hasil deteksi menunjukkan ini adalah ${ingredient.name}.`,
      // Mengambil array highlights dari ingredient sebagai benefits
      benefits: ingredient.highlights || [], 
    };

    return await this.create(scanData);
  }

  async remove(id: string): Promise<void> {
    await this.scansRepository.delete(id);
  }
}