import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Nama device',
    example: 'Display Kantor Pusat',
  })
  name: string;

  @ApiProperty({
    description: 'Lokasi device berada',
    example: 'Lantai 1, Ruang Tunggu',
  })
  location: string;

  @ApiProperty({
    description: 'Status device (online/offline)',
    example: 'online',
    required: false,
    default: 'offline',
  })
  status?: string;
}
