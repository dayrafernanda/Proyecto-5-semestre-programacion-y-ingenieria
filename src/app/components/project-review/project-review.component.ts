import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReviewProject {
  id: string;
  title: string;
  student: string;
  studentId: string;
  area: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  daysLeft: number;
}

@Component({
  selector: 'app-project-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-review.component.html',
  styleUrl: './project-review.component.scss'
})
export class ProjectReviewComponent implements OnInit {
  projectsToReview: ReviewProject[] = [
    {
      id: 'PRJ-001',
      title: 'Sistema de Gestión Académica',
      student: 'Ana García López',
      studentId: 'A12345',
      area: 'Desarrollo Web',
      status: 'pending',
      priority: 'high',
      daysLeft: 1
    },
    {
      id: 'PRJ-002',
      title: 'Análisis de Datos Educativos',
      student: 'Carlos Rodríguez',
      studentId: 'A12346',
      area: 'Ciencia de Datos',
      status: 'in_progress',
      priority: 'medium',
      daysLeft: 3
    },
    {
      id: 'PRJ-003',
      title: 'App Móvil Educativa',
      student: 'María Fernández',
      studentId: 'A12347',
      area: 'Desarrollo Móvil',
      status: 'pending',
      priority: 'high',
      daysLeft: 0
    },
    {
      id: 'PRJ-004',
      title: 'Plataforma E-learning',
      student: 'Juan Martínez',
      studentId: 'A12348',
      area: 'Desarrollo Web',
      status: 'completed',
      priority: 'low',
      daysLeft: 5
    }
  ];

  showDetailsModal: boolean = false;
  showReviewModal: boolean = false;
  selectedProject: ReviewProject | null = null;
  reviewComments: string = '';
  
  currentFilter: string = 'all';
  filteredProjects: ReviewProject[] = [];

  reviewStatus: string = 'completed';

  ngOnInit() {
    this.applyFilter('all');
  }

  applyFilter(filter: string) {
    this.currentFilter = filter;
    
    switch (filter) {
      case 'pending':
        this.filteredProjects = this.projectsToReview.filter(p => p.status === 'pending');
        break;
      case 'in_progress':
        this.filteredProjects = this.projectsToReview.filter(p => p.status === 'in_progress');
        break;
      case 'completed':
        this.filteredProjects = this.projectsToReview.filter(p => p.status === 'completed');
        break;
      default:
        this.filteredProjects = [...this.projectsToReview];
    }
  }

  getFilterButtonClass(filter: string): string {
    return this.currentFilter === filter ? 'btn-light' : 'btn-outline-light';
  }

  get totalProjectsCount(): number {
    return this.projectsToReview.length;
  }

  get pendingProjectsCount(): number {
    return this.projectsToReview.filter(p => p.status === 'pending').length;
  }

  get highPriorityProjectsCount(): number {
    return this.projectsToReview.filter(p => p.priority === 'high').length;
  }

  get completedProjectsCount(): number {
    return this.projectsToReview.filter(p => p.status === 'completed').length;
  }

  get urgentProjectsCount(): number {
    return this.projectsToReview.filter(p => p.daysLeft <= 1 && p.daysLeft >= 0).length;
  }

  get urgentProjects(): ReviewProject[] {
    return this.projectsToReview.filter(p => p.daysLeft <= 1 && p.daysLeft >= 0);
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-warning',
      'in_progress': 'bg-info',
      'completed': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completado'
    };
    return statusTexts[status] || status;
  }

  getPriorityBadgeClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'low': 'bg-secondary',
      'medium': 'bg-warning',
      'high': 'bg-danger'
    };
    return priorityClasses[priority] || 'bg-secondary';
  }

  getDaysLeftText(daysLeft: number): string {
    if (daysLeft > 0) {
      return daysLeft + ' días';
    } else {
      return 'Vencido';
    }
  }

  getPriorityText(priority: string): string {
    const priorityTexts: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media', 
      'high': 'Alta'
    };
    return priorityTexts[priority] || priority;
  }

  viewDetails(projectId: string) {
    this.selectedProject = this.projectsToReview.find(p => p.id === projectId) || null;
    this.showDetailsModal = true;
  }

  startReview(projectId: string) {
    this.selectedProject = this.projectsToReview.find(p => p.id === projectId) || null;
    if (this.selectedProject) {
      this.reviewComments = '';
      this.reviewStatus = this.selectedProject.status;
      this.showReviewModal = true;
    }
  }

  submitReview() {
    if (this.selectedProject && this.reviewComments.trim()) {
      const projectIndex = this.projectsToReview.findIndex(p => p.id === this.selectedProject!.id);
      if (projectIndex !== -1) {
        this.projectsToReview[projectIndex] = {
          ...this.projectsToReview[projectIndex],
          status: this.reviewStatus as 'pending' | 'in_progress' | 'completed'
        };
      }

      const statusText = this.getStatusText(this.reviewStatus);
      alert(`✅ Revisión enviada exitosamente!\n\n` +
            `Proyecto: ${this.selectedProject.title}\n` +
            `Nuevo estado: ${statusText}\n` +
            `Comentarios guardados: ${this.reviewComments}`);

      this.closeModals();
      
      this.applyFilter(this.currentFilter);
    } else {
      alert('❌ Por favor ingresa comentarios de revisión');
    }
  }

  closeModals() {
    this.showDetailsModal = false;
    this.showReviewModal = false;
    this.selectedProject = null;
    this.reviewComments = '';
    this.reviewStatus = 'completed';
  }

  getActiveFilterText(): string {
    switch (this.currentFilter) {
      case 'all': return 'Todos los proyectos';
      case 'pending': return 'Proyectos pendientes';
      case 'in_progress': return 'Proyectos en progreso';
      case 'completed': return 'Proyectos completados';
      default: return 'Todos los proyectos';
    }
  }
}