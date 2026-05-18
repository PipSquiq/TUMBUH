import { Controller, Post, Get, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { ScanEntity } from '../entities/scan.entity';

@Controller('scans')
export class ScansController {
  constructor(private scansService: ScansService) {}

  @Post()
  async create(@Body() createScanDto: CreateScanDto): Promise<ScanEntity> {
    return await this.scansService.create(createScanDto);
  }

  /**
   * Endpoint untuk scan bahan pangan berbasis label AI
   * Frontend mengirim label yang sudah dideteksi AI
   * Backend akan return nutrisi lengkap + resep yang direkomendasikan
   */
  @Post('process')
  @ApiQuery({
    name: 'label',
    required: true,
    description: 'Label bahan yang terdeteksi oleh AI (Ikan, Ayam, Sayuran, dll)',
    example: 'Ikan',
  })
  @ApiQuery({
    name: 'confidence',
    required: false,
    description: 'Confidence score dari AI detection (0-100)',
    example: '95',
  })
  async processScan(
    @Query('label') label: string,
    @Query('confidence') confidence: string = '100',
  ): Promise<ScanEntity> {
    const confidenceScore = parseInt(confidence, 10);
    return await this.scansService.processScanByLabel(label, confidenceScore);
  }

  @Get()
  async findAll(): Promise<ScanEntity[]> {
    return await this.scansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ScanEntity> {
    return await this.scansService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.scansService.remove(id);
  }
}