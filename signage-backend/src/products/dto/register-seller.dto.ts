import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodDto {
  @ApiProperty({
    description: 'Jenis pembayaran',
    enum: ['bank_transfer', 'e_wallet', 'cod', 'qris'],
    example: 'bank_transfer',
  })
  @IsNotEmpty({ message: 'Jenis pembayaran wajib diisi' })
  @IsEnum(['bank_transfer', 'e_wallet', 'cod', 'qris'], {
    message: 'Jenis pembayaran harus bank_transfer, e_wallet, cod, atau qris',
  })
  type: string;

  @ApiProperty({
    description: 'Nama provider (BCA, BNI, Mandiri, GoPay, Dana, OVO, dll)',
    example: 'BCA',
    required: false,
  })
  @ValidateIf((o) => o.type === 'bank_transfer' || o.type === 'e_wallet')
  @IsNotEmpty({ message: 'Provider wajib diisi untuk bank_transfer dan e_wallet' })
  @IsString()
  provider?: string;

  @ApiProperty({
    description: 'Nomor rekening atau nomor e-wallet',
    example: '1234567890',
    required: false,
  })
  @ValidateIf((o) => o.type === 'bank_transfer' || o.type === 'e_wallet')
  @IsNotEmpty({ message: 'Nomor rekening/e-wallet wajib diisi untuk bank_transfer dan e_wallet' })
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    description: 'Nama pemegang rekening atau akun',
    example: 'Budi Santoso',
    required: false,
  })
  @ValidateIf((o) => o.type === 'bank_transfer' || o.type === 'e_wallet')
  @IsNotEmpty({ message: 'Nama pemegang akun wajib diisi untuk bank_transfer dan e_wallet' })
  @IsString()
  accountName?: string;

  @ApiProperty({
    description: 'URL gambar QRIS',
    example: 'https://cloudinary.com/...',
    required: false,
  })
  @ValidateIf((o) => o.type === 'qris')
  @IsNotEmpty({ message: 'Gambar QRIS wajib diunggah' })
  @IsString()
  qrisImage?: string;
}

export class RegisterSellerDto {
  @ApiProperty({
    description: 'Daftar metode pembayaran penjual (minimal 1)',
    type: [PaymentMethodDto],
  })
  @IsArray({ message: 'paymentMethods harus berupa array' })
  @ArrayMinSize(1, { message: 'Minimal 1 metode pembayaran harus diisi' })
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodDto)
  paymentMethods: PaymentMethodDto[];
}
