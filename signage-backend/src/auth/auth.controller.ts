import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Daftar pengguna baru' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'budi_santoso' },
        phoneNumber: { type: 'string', example: '08123456789' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['username', 'phoneNumber', 'password'],
    },
  })
  async register(@Body() body: any) {
    return this.authService.register(body.username, body.phoneNumber, body.password);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login dan dapatkan JWT token',
    description: 'Kirim username & password untuk mendapatkan access token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'budi_santoso' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }
}