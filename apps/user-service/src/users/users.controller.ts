import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { User } from './entities/user.entity.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import type { Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private ensureAvatarDir(): string {
    const avatarsDir = join(process.cwd(), 'uploads', 'avatars');
    if (!existsSync(avatarsDir)) {
      mkdirSync(avatarsDir, { recursive: true });
    }
    return avatarsDir;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: CurrentUserPayload): Promise<User> {
    return this.usersService.findById(user.sub);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Put('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile avatar' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const avatarsDir = join(process.cwd(), 'uploads', 'avatars');
          if (!existsSync(avatarsDir)) {
            mkdirSync(avatarsDir, { recursive: true });
          }
          cb(null, avatarsDir);
        },
        filename: (req, file, cb) => {
          const currentUser = req.user as CurrentUserPayload;
          const safeExt = extname(file.originalname || '').toLowerCase() || '.jpg';
          cb(null, `${currentUser.sub}-${Date.now()}${safeExt}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const avatarUrl = `/api/v1/users/avatars/${file.filename}`;
    return this.usersService.updateAvatar(user.sub, avatarUrl);
  }

  @Get('avatars/:filename')
  @ApiOperation({ summary: 'Get avatar image by filename' })
  async getAvatar(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    const avatarsDir = this.ensureAvatarDir();
    res.sendFile(filename, { root: avatarsDir });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public profile)' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: "Get user's public events" })
  async getUserEvents(@Param('id', ParseUUIDPipe) id: string): Promise<{ userId: string }> {
    // Placeholder – event data comes from Event Service via gateway aggregation
    return { userId: id };
  }
}
