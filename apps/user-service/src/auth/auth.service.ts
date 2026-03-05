import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { UserKafkaProducer } from '../kafka/user-kafka.producer.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { User } from '../users/entities/user.entity.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userKafkaProducer: UserKafkaProducer,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      password: dto.password,
      passwordHash,
    });

    const tokens = await this.generateTokens(user);

    await this.userKafkaProducer.publishUserRegistered({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as 'attendee' | 'organizer',
      authProvider: 'local',
      registeredAt: user.createdAt.toISOString(),
    });

    return this.buildAuthResponse(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);
    return this.buildAuthResponse(user, tokens);
  }

  async logout(_userId: string): Promise<{ message: string }> {
    // In a production setup, blacklist the refresh token in Redis
    this.logger.log(`User ${_userId} logged out`);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.validateRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);
    return this.generateTokens(user);
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    // In production, verify the Google ID token via Google API
    // For now, decode the payload (the gateway or frontend handles OAuth flow)
    let payload: {
      sub: string;
      email: string;
      given_name: string;
      family_name: string;
      picture?: string;
    };

    try {
      payload = this.jwtService.decode(idToken) as typeof payload;
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    let user = await this.usersService.findByGoogleId(payload.sub);

    if (!user) {
      user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        user = await this.usersService.createFromGoogle({
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          googleId: payload.sub,
          avatarUrl: payload.picture ?? null,
        });

        await this.userKafkaProducer.publishUserRegistered({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as 'attendee' | 'organizer',
          authProvider: 'google',
          registeredAt: user.createdAt.toISOString(),
        });
      }
    }

    const tokens = await this.generateTokens(user);
    return this.buildAuthResponse(user, tokens);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgRoles: {} as Record<string, string>,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: user.id, type: 'refresh' },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async validateRefreshToken(token: string): Promise<{ sub: string; type: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; type: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private buildAuthResponse(user: User, tokens: AuthTokens): AuthResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }
}
