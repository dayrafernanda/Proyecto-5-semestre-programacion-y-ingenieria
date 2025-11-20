export type UserRole = 'student' | 'teacher' | 'coordinator' | 'admin' | 'tutor';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  studentId?: string;
  specialization?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
}
