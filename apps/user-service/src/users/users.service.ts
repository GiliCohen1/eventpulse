import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async create(dto: CreateUserDto & { passwordHash: string | null }): Promise<User> {
    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role ?? 'attendee',
    });

    return this.usersRepository.save(user);
  }

  async createFromGoogle(profile: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    avatarUrl: string | null;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: profile.email,
      passwordHash: null,
      firstName: profile.firstName,
      lastName: profile.lastName,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
      emailVerified: true,
      role: 'attendee',
    });

    return this.usersRepository.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }
    if (dto.location !== undefined) {
      user.location = dto.location;
    }

    return this.usersRepository.save(user);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }
}
