import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createManual(userData: any): Promise<UserEntity> {
    const { username, phoneNumber } = userData;

    // 1. Cek duplikasi
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: username },
        { phoneNumber: phoneNumber }
      ],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username sudah digunakan');
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw new ConflictException('Nomor telepon sudah terdaftar');
      }
    }

    // 2. Buat entitas (Tegaskan tipe datanya adalah UserEntity, bukan Array)
    const newUser: UserEntity = this.usersRepository.create(userData as UserEntity);

    // 3. Simpan dan kembalikan sebagai satu objek
    return await this.usersRepository.save(newUser);
  }

  async findByUsername(username: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async findOrCreateFromJwtPayload(payload: JwtPayload): Promise<UserEntity> {
    const { sub: id, role, username } = payload;
    let user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      const newUser = this.usersRepository.create({ 
        id, 
        role: role || 'user', 
        username 
      } as UserEntity);
      user = await this.usersRepository.save(newUser);
    }

    return user;
  }

  async findOne(id: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['products'] 
    });
    return user ?? undefined;
  }
}