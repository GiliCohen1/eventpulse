import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { OrgMemberRole } from '@eventpulse/shared-types';
import { Organization } from './entities/organization.entity.js';
import { OrganizationMember } from './entities/organization-member.entity.js';
import type { CreateOrganizationDto } from './dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from './dto/update-organization.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    const existingSlug = await this.orgRepository.findOne({ where: { slug: dto.slug } });

    if (existingSlug) {
      throw new ConflictException(`Organization slug "${dto.slug}" is already taken`);
    }

    const org = this.orgRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      website: dto.website ?? null,
      createdBy: userId,
    });

    const savedOrg = await this.orgRepository.save(org);

    // Add creator as owner
    const ownerMember = this.memberRepository.create({
      organizationId: savedOrg.id,
      userId,
      role: 'owner' as OrgMemberRole,
    });

    await this.memberRepository.save(ownerMember);

    return savedOrg;
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { id } });

    if (!org) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }

    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { slug } });

    if (!org) {
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    }

    return org;
  }

  async update(id: string, userId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findById(id);
    await this.assertUserIsOrgAdmin(id, userId);

    if (dto.slug && dto.slug !== org.slug) {
      const existingSlug = await this.orgRepository.findOne({ where: { slug: dto.slug } });

      if (existingSlug) {
        throw new ConflictException(`Organization slug "${dto.slug}" is already taken`);
      }
    }

    Object.assign(org, dto);
    return this.orgRepository.save(org);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findById(id);
    await this.assertUserIsOrgOwner(id, userId);
    await this.orgRepository.delete(id);
  }

  // ── Members ──

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    await this.findById(orgId);
    return this.memberRepository.find({
      where: { organizationId: orgId },
      order: { joinedAt: 'ASC' },
    });
  }

  async addMember(
    orgId: string,
    requestingUserId: string,
    userId: string,
    role: OrgMemberRole,
  ): Promise<OrganizationMember> {
    await this.findById(orgId);
    await this.assertUserIsOrgAdmin(orgId, requestingUserId);

    const existing = await this.memberRepository.findOne({
      where: { organizationId: orgId, userId },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    const member = this.memberRepository.create({
      organizationId: orgId,
      userId,
      role,
    });

    return this.memberRepository.save(member);
  }

  async removeMember(orgId: string, requestingUserId: string, userId: string): Promise<void> {
    await this.findById(orgId);
    await this.assertUserIsOrgAdmin(orgId, requestingUserId);

    const member = await this.memberRepository.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    await this.memberRepository.delete(member.id);
  }

  // ── Authorization helpers ──

  private async assertUserIsOrgAdmin(orgId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (member.role !== 'owner' && member.role !== 'admin') {
      throw new ForbiddenException('You do not have admin access to this organization');
    }
  }

  private async assertUserIsOrgOwner(orgId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the organization owner can perform this action');
    }
  }
}
