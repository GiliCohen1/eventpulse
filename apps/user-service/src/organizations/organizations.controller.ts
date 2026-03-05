import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, Roles, RolesGuard } from '@eventpulse/common';
import type { CurrentUserPayload } from '@eventpulse/common';
import type { OrgMemberRole } from '@eventpulse/shared-types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import type { Organization } from './entities/organization.entity.js';
import type { OrganizationMember } from './entities/organization-member.entity.js';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  async findAll(): Promise<Organization[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Organization> {
    return this.organizationsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Organization> {
    return this.organizationsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an organization' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an organization' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.organizationsService.remove(id, user.sub);
  }

  // ── Members ──

  @Get(':id/members')
  @ApiOperation({ summary: 'List organization members' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationMember[]> {
    return this.organizationsService.getMembers(id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a member to the organization' })
  async addMember(
    @Param('id', ParseUUIDPipe) orgId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('role') role: OrgMemberRole = 'member',
  ): Promise<OrganizationMember> {
    return this.organizationsService.addMember(orgId, user.sub, userId, role);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a member from the organization' })
  async removeMember(
    @Param('id', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.organizationsService.removeMember(orgId, user.sub, userId);
  }
}
