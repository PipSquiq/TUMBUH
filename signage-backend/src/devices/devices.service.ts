import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from '../entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private devicesRepository: Repository<DeviceEntity>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<DeviceEntity> {
    const device = this.devicesRepository.create(createDeviceDto);
    return await this.devicesRepository.save(device);
  }

  async findAll(): Promise<DeviceEntity[]> {
    return await this.devicesRepository.find();
  }

  async findOne(id: string): Promise<DeviceEntity> {
    const device = await this.devicesRepository.findOne({ where: { id } });

    if (!device) {
      throw new NotFoundException(`Device dengan ID ${id} tidak ditemukan`);
    }

    return device;
  }

  async update(id: string, updateDeviceDto: Partial<CreateDeviceDto>): Promise<DeviceEntity> {
    await this.devicesRepository.update(id, updateDeviceDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.devicesRepository.delete(id);
  }
}
