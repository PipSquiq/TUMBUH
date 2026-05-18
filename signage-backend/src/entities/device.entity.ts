import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('devices')
export class DeviceEntity {
  @ApiProperty({
    description: 'ID unik device menggunakan UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nama device',
    example: 'Display Kantor Pusat',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Lokasi device berada',
    example: 'Lantai 1, Ruang Tunggu',
  })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ApiProperty({
    description: 'Status device (online/offline)',
    example: 'online',
    default: 'offline',
  })
  @Column({ type: 'varchar', length: 50, default: 'offline' })
  status: string;

  @ApiProperty({
    description: 'Waktu pembuatan device',
    example: '2024-01-15T10:30:00Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir device',
    example: '2024-01-15T10:30:00Z',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
