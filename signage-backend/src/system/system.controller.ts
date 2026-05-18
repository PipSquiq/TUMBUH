import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('system')
export class SystemController {
  /**
   * Endpoint untuk mendapatkan waktu server saat ini
   * Digunakan untuk menentukan apakah tampilkan icon Matahari (day) atau Bulan (night)
   */
  @Get('status')
  @ApiOperation({ summary: 'Dapatkan status sistem dan waktu server' })
  @ApiResponse({
    status: 200,
    description: 'Status sistem dan waktu server',
    schema: {
      example: {
        timestamp: '2024-01-27T18:54:00.000Z',
        hour: 18,
        isDaytime: false,
        timezone: 'UTC',
        message: 'Server is running',
      },
    },
  })
  getSystemStatus() {
    const now = new Date();
    const hour = now.getHours();
    // Anggap daytime antara jam 6 pagi sampai 6 sore
    const isDaytime = hour >= 6 && hour < 18;

    return {
      timestamp: now.toISOString(),
      hour,
      isDaytime,
      timezone: 'UTC',
      message: 'Server is running',
    };
  }
}