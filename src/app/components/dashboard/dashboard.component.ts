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
      // MÓDULOS PARA ESTUDIANTES
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

      // MÓDULOS PARA DOCENTES
      {
        title: 'Revisar Proyectos',
        description: 'Revisar proyectos asignados',
        icon: 'bi-search',
        route: '/revisar-proyectos',
        roles: ['teacher', 'tutor'],
        color: 'warning'
      },

      // MÓDULOS PARA COORDINADORES
      {
        title: 'Auditoría',
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

      // MÓDULOS PARA ADMINISTRADORES
      {
        title: 'Gestión de Usuarios',
        description: 'Administrar cuentas de usuario',
        icon: 'bi-people',
        route: '/gestion-usuarios',
        roles: ['admin'],
        color: 'dark'
      },
      {
        title: 'Auditoría del Sistema',
        description: 'Monitoreo del sistema',
        icon: 'bi-graph-up',
        route: '/auditoria-sistema',
        roles: ['admin'],
        color: 'danger'
      },
      {
        title: 'Configuración Académica',
        description: 'Configuración del sistema',
        icon: 'bi-gear',
        route: '/configuracion-academica',
        roles: ['admin'],
        color: 'secondary'
      },

      // MÓDULOS PARA TODOS LOS ROLES
      {
        title: 'Repositorio',
        description: 'Proyectos aprobados de referencia',
        icon: 'bi-archive',
        route: '/repositorio',
        roles: ['student', 'teacher', 'coordinator', 'admin', 'tutor'],
        color: 'secondary'
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
