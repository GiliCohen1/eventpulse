import { Controller, Get, Put, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { User } from './entities/user.entity.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
