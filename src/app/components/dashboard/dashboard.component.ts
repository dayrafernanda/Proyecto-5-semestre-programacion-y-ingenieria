import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

interface DashboardItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: UserRole[];
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  dashboardItems: DashboardItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.loadDashboardItems();
    });
  }

  loadDashboardItems() {
    const allItems: DashboardItem[] = [
      {
        title: 'Nuevo Proyecto',
        description: 'Crear un nuevo proyecto de grado',
        icon: 'bi-plus-circle',
        route: '/nuevo-proyecto',
        roles: ['student'],
        color: 'success'
      },
      {
        title: 'Mi Portafolio',
        description: 'Ver el estado de mis proyectos',
        icon: 'bi-folder',
        route: '/mi-portafolio',
        roles: ['student'],
        color: 'info'
      },
      {
        title: 'Mis Entregas',
        description: 'Gestionar mis entregas de proyecto',
        icon: 'bi-upload',
        route: '/mis-entregas',
        roles: ['student'],
        color: 'primary'
      },

      {
        title: 'Revisar Proyectos',
        description: 'Revisar proyectos asignados',
        icon: 'bi-search',
        route: '/revisar-proyectos',
        roles: ['teacher', 'tutor'],
        color: 'warning'
      },
      {
        title: 'Proyectos Asignados',
        description: 'Ver mis proyectos asignados',
        icon: 'bi-list-check',
        route: '/proyectos-asignados',
        roles: ['teacher', 'tutor'],
        color: 'primary'
      },
      {
        title: 'Calificaciones',
        description: 'Gestionar calificaciones de proyectos',
        icon: 'bi-check-circle',
        route: '/calificaciones',
        roles: ['teacher', 'tutor'],
        color: 'info'
      },
      {
        title: 'Rúbricas de Evaluación',
        description: 'Configurar criterios de evaluación',
        icon: 'bi-clipboard-check',
        route: '/rubricas',
        roles: ['teacher', 'tutor'],
        color: 'secondary'
      },

      {
        title: 'Auditoría de Proyectos',
        description: 'Validar y auditar proyectos',
        icon: 'bi-shield-check',
        route: '/auditoria',
        roles: ['coordinator'],
        color: 'danger'
      },
      {
        title: 'Periodos Académicos',
        description: 'Configurar fechas y periodos',
        icon: 'bi-calendar',
        route: '/periodos-academicos',
        roles: ['coordinator'],
        color: 'primary'
      },
      {
        title: 'Asignación de Docentes',
        description: 'Asignar docentes a proyectos',
        icon: 'bi-person-plus',
        route: '/asignacion-docentes',
        roles: ['coordinator'],
        color: 'info'
      },
      {
        title: 'Reportes Institucionales',
        description: 'Generar reportes académicos',
        icon: 'bi-graph-up',
        route: '/reportes-institucionales',
        roles: ['coordinator'],
        color: 'success'
      },

      {
        title: 'Seguimiento de Proyectos',
        description: 'Seguimiento de proyectos tutorados',
        icon: 'bi-binoculars',
        route: '/seguimiento-proyectos',
        roles: ['tutor'],
        color: 'info'
      },
      {
        title: 'Retroalimentación',
        description: 'Proporcionar retroalimentación',
        icon: 'bi-chat-left-text',
        route: '/retroalimentacion',
        roles: ['tutor'],
        color: 'warning'
      },

      {
        title: 'Gestión de Usuarios',
        description: 'Administrar cuentas de usuario',
        icon: 'bi-people',
        route: '/user-management',
        roles: ['admin'],
        color: 'dark'
      },
      {
        title: 'Auditoría del Sistema',
        description: 'Monitoreo del sistema',
        icon: 'bi-graph-up',
        route: '/audit-system',
        roles: ['admin'],
        color: 'danger'
      },
      {
        title: 'Configuración Académica',
        description: 'Configuración del sistema',
        icon: 'bi-gear',
        route: '/academic-config',
        roles: ['admin'],
        color: 'secondary'
      },
      {
        title: 'Reportes y Análisis',
        description: 'Generar reportes estadísticos',
        icon: 'bi-graph-up',
        route: '/reports',
        roles: ['admin'],
        color: 'success'
      },
      {
        title: 'Sistema de Notificaciones',
        description: 'Gestionar notificaciones',
        icon: 'bi-bell',
        route: '/notifications',
        roles: ['admin'],
        color: 'secondary'
      },

      {
        title: 'Repositorio',
        description: 'Proyectos aprobados de referencia',
        icon: 'bi-archive',
        route: '/repositorio',
        roles: ['student', 'teacher', 'coordinator', 'admin', 'tutor'],
        color: 'secondary'
      },
      {
        title: 'Perfil de Usuario',
        description: 'Gestionar mi perfil y configuración',
        icon: 'bi-person',
        route: '/perfil',
        roles: ['student', 'teacher', 'coordinator', 'admin', 'tutor'],
        color: 'info'
      }
    ];

    this.dashboardItems = allItems.filter(item => 
      item.roles.includes(this.currentUser?.role as UserRole)
    );
  }

  getUserRoleName(role: UserRole): string {
    const roleNames: { [key in UserRole]: string } = {
      student: 'Estudiante',
      teacher: 'Docente',
      coordinator: 'Coordinador',
      admin: 'Administrador',
      tutor: 'Tutor'
    };
    return roleNames[role] || role;
  }

  getRoleBadgeClass(role: UserRole): string {
    const roleClasses: { [key in UserRole]: string } = {
      student: 'bg-success',
      teacher: 'bg-warning',
      coordinator: 'bg-primary',
      admin: 'bg-dark',
      tutor: 'bg-info'
    };
    return roleClasses[role] || 'bg-secondary';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}