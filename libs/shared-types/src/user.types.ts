// ============================================
// User Types
// ============================================

export type UserRole = 'attendee' | 'organizer' | 'admin';

export type OrgMemberRole = 'owner' | 'admin' | 'member';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  googleId: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  createdBy: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgMemberRole;
  joinedAt: string;
}
