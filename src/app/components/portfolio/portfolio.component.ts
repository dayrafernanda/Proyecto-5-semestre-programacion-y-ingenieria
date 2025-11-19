import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface StudentProject {
  id: string;
  title: string;
  status: 'draft' | 'under_review' | 'corrections_required' | 'approved' | 'rejected';
  submittedDate: Date;
  lastUpdate: Date;
  reviewer?: string;
  feedback?: string;
  grade?: number;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  studentProjects: StudentProject[] = [
    {
      id: '1',
      title: 'Sistema de Gestión Académica con IA',
      status: 'under_review',
      submittedDate: new Date('2024-01-15'),
      lastUpdate: new Date('2024-01-15'),
      reviewer: 'Dra. María López'
    },
    {
      id: '2', 
      title: 'Plataforma E-learning Adaptativa',
      status: 'approved',
      submittedDate: new Date('2023-11-20'),
      lastUpdate: new Date('2023-12-10'),
      reviewer: 'Dr. Roberto Fernández',
      grade: 4.8
    },
    {
      id: '3',
      title: 'App Móvil para Control de Asistencia',
      status: 'corrections_required',
      submittedDate: new Date('2024-01-10'),
      lastUpdate: new Date('2024-01-18'),
      reviewer: 'Dra. María López',
      feedback: 'Falta especificar la metodología de desarrollo y justificar la selección de tecnologías.'
    },
    {
      id: '4',
      title: 'Análisis de Datos Educativos',
      status: 'draft',
      submittedDate: new Date('2024-01-05'),
      lastUpdate: new Date('2024-01-05')
    }
  ];

  get totalProjectsCount(): number {
    return this.studentProjects.length;
  }

  get approvedProjectsCount(): number {
    return this.studentProjects.filter(p => p.status === 'approved').length;
  }

  get underReviewProjectsCount(): number {
    return this.studentProjects.filter(p => p.status === 'under_review').length;
  }

  get correctionsRequiredProjectsCount(): number {
    return this.studentProjects.filter(p => p.status === 'corrections_required').length;
  }

  get draftProjectsCount(): number {
    return this.studentProjects.filter(p => p.status === 'draft').length;
  }

  ngOnInit() {}

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'draft': 'bg-secondary',
      'under_review': 'bg-warning',
      'corrections_required': 'bg-danger',
      'approved': 'bg-success',
      'rejected': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'draft': 'Borrador',
      'under_review': 'En Revisión',
      'corrections_required': 'Correcciones Requeridas',
      'approved': 'Aprobado',
      'rejected': 'Rechazado'
    };
    return statusTexts[status] || status;
  }

  getDaysAgo(date: Date): string {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  }
}