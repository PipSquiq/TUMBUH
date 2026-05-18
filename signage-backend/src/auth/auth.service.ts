import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // Fitur REGISTER
  async register(username: string, phoneNumber: string, pass: string) {
    // Cek apakah user sudah ada berdasarkan username atau nomor telepon
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    // Hash password agar aman di database
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Simpan ke database melalui UsersService
    return this.usersService.createManual({
      username,
      phoneNumber,
      password: hashedPassword,
      role: 'user',
    });
  }

  // Fitur LOGIN
  async login(username: string, pass: string): Promise<{ access_token: string }> {
    // 1. Cari user di database
    const user = await this.usersService.findByUsername(username);

    // 2. Bandingkan password
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Username atau Password salah');
    }

    // 3. Generate token
    const token = this.generateToken(user.id, user.username, user.role);

    return {
      access_token: token,
    };
  }

  generateToken(userId: string, username: string, role: string = 'user'): string {
    const payload: JwtPayload = {
      sub: userId,
      username,
      role,
    };

    return this.jwtService.sign(payload);
  }

  validateToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid atau expired');
    }
  }
}