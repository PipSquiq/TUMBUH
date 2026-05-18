import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceEntity } from '../entities/device.entity';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<DeviceEntity> {
    return await this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(): Promise<DeviceEntity[]> {
    return await this.devicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DeviceEntity> {
    return await this.devicesService.findOne(id);
  }
}
