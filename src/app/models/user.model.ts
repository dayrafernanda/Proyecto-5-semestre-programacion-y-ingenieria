export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  specialization?: string;
  studentId?: string;
  phone?: string;
  avatar?: string;
  token?: string;
}

export type UserRole = 'student' | 'teacher' | 'coordinator' | 'admin' | 'tutor';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  studentId?: string;
  specialization?: string;
}

export interface RolePermissions {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canReviewProjects: boolean;
  canManageUsers: boolean;
  canViewAudit: boolean;
  canManageAcademicPeriods: boolean;
  canViewRepository: boolean;
  canAssignReviewers: boolean;
  canViewAllProjects: boolean;
}

export const ROLE_PERMISSIONS: { [key in UserRole]: RolePermissions } = {
  student: {
    canCreateProjects: true,
    canEditProjects: true,
    canReviewProjects: false,
    canManageUsers: false,
    canViewAudit: false,
    canManageAcademicPeriods: false,
    canViewRepository: true,
    canAssignReviewers: false,
    canViewAllProjects: false
  },
  teacher: {
    canCreateProjects: false,
    canEditProjects: false,
    canReviewProjects: true,
    canManageUsers: false,
    canViewAudit: false,
    canManageAcademicPeriods: false,
    canViewRepository: true,
    canAssignReviewers: false,
    canViewAllProjects: true
  },
  coordinator: {
    canCreateProjects: false,
    canEditProjects: false,
    canReviewProjects: true,
    canManageUsers: false,
    canViewAudit: true,
    canManageAcademicPeriods: true,
    canViewRepository: true,
    canAssignReviewers: true,
    canViewAllProjects: true
  },
  admin: {
    canCreateProjects: false,
    canEditProjects: false,
    canReviewProjects: false,
    canManageUsers: true,
    canViewAudit: true,
    canManageAcademicPeriods: true,
    canViewRepository: true,
    canAssignReviewers: false,
    canViewAllProjects: true
  },
  tutor: {
    canCreateProjects: false,
    canEditProjects: true,
    canReviewProjects: true,
    canManageUsers: false,
    canViewAudit: false,
    canManageAcademicPeriods: false,
    canViewRepository: true,
    canAssignReviewers: false,
    canViewAllProjects: false
  }
};
