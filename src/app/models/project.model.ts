export interface Project {
  id: string;
  title: string;
  summary: string;
  knowledgeArea: string;
  objectives: string;
  methodology?: string;
  expectedResults?: string;
  bibliography?: string;
  status: ProjectStatus;
  studentId: string;
  studentName: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewerName?: string;
  currentVersion: number;
  academicPeriodId: string;
  feedback?: Feedback[];
  documents?: Document[];
  tags?: string[];
  plagiarismScore?: number;
}

export type ProjectStatus = 
  | 'draft' 
  | 'under_review' 
  | 'corrections_required' 
  | 'approved' 
  | 'rejected';

export interface Feedback {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  createdAt: Date;
  isUrgent: boolean;
  requiresResubmission: boolean;
  deadline?: Date;
  section?: string;
}

export interface Document {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  version: number;
  isPrimary: boolean;
}

export interface ProjectFilter {
  status?: ProjectStatus;
  knowledgeArea?: string;
  studentName?: string;
  academicPeriod?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
