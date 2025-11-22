import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface StudentProject {
  id: string;
  title: string;
  status: 'draft' | 'under_review' | 'corrections_required' | 'approved' | 'rejected';
  submittedDate: Date;
  lastUpdate: Date;
  reviewer?: string;
  feedback?: string;
  grade?: number;
  knowledgeArea?: string;
  objectives?: string;
  summary?: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  studentProjects: StudentProject[] = [];
  
  filteredProjects: StudentProject[] = [];
  filterStatus: string = 'all';
  sortOrder: 'recent' | 'oldest' = 'recent';

  ngOnInit() {
    this.loadProjectsFromStorage();
  }

  loadProjectsFromStorage() {
    try {
      console.log('��� Cargando proyectos desde localStorage...');
      
      const savedProjects = localStorage.getItem('studentProjects');
      console.log('��� Datos en localStorage:', savedProjects);
      
      if (savedProjects) {
        const projectsFromStorage: StudentProject[] = JSON.parse(savedProjects);
        console.log('��� Proyectos parseados:', projectsFromStorage);
        
        projectsFromStorage.forEach(project => {
          project.submittedDate = new Date(project.submittedDate);
          project.lastUpdate = new Date(project.lastUpdate);
        });

        this.studentProjects = projectsFromStorage;
        console.log('✅ Proyectos cargados exitosamente:', this.studentProjects.length);
      } else {
        console.log('ℹ️ No hay proyectos guardados en localStorage');
        this.studentProjects = [];
      }

      if (this.studentProjects.length === 0) {
        console.log('➕ Agregando proyectos de ejemplo');
        this.studentProjects = this.getExampleProjects();
      }
      
      this.sortProjects();
      this.filterProjects();
      
    } catch (error) {
      console.error('❌ Error cargando proyectos:', error);
      this.studentProjects = this.getExampleProjects();
      this.sortProjects();
      this.filterProjects();
    }
  }

  private getExampleProjects(): StudentProject[] {
    return [
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
        status: 'draft',
        submittedDate: new Date('2024-01-10'),
        lastUpdate: new Date('2024-01-18')
      }
    ];
  }

  sortProjects() {
    this.studentProjects.sort((a, b) => {
      const dateA = new Date(a.submittedDate).getTime();
      const dateB = new Date(b.submittedDate).getTime();
      return this.sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });
    this.filterProjects();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'recent' ? 'oldest' : 'recent';
    this.sortProjects();
  }

  filterProjects() {
    if (this.filterStatus === 'all') {
      this.filteredProjects = [...this.studentProjects];
    } else {
      this.filteredProjects = this.studentProjects.filter(project => 
        project.status === this.filterStatus
      );
    }
    console.log('��� Proyectos filtrados:', this.filteredProjects.length);
  }

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

  refreshProjects() {
    console.log('��� Recargando proyectos...');
    this.loadProjectsFromStorage();
  }

  clearProjects() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los proyectos? Esto es solo para testing.')) {
      localStorage.removeItem('studentProjects');
      this.loadProjectsFromStorage();
      console.log('���️ Todos los proyectos eliminados');
    }
  }
}
