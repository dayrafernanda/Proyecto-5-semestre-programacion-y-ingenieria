import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AuditSystemComponent } from './components/audit-system/audit-system.component';
import { AcademicConfigComponent } from './components/academic-config/academic-config.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  
  {
    path: 'dashboard',
    loadComponent: () => import ('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), 
    canActivate: [AuthGuard]
  },
  {
    path: 'nuevo-proyecto',
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] }
  },
  {
    path: 'mi-portafolio',
    loadComponent: () => import('./components/portfolio/portfolio.component').then(m => m.PortfolioComponent), 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] }
  },
  {
    path: 'revisar-proyectos',
    loadComponent: () => import('./components/project-review/project-review.component').then(m => m.ProjectReviewComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher', 'coordinator', 'tutor'] }
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    title: 'Panel de Administración'
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    title: 'Gestión de Usuarios'
  },
  {
    path: 'admin/audit',
    component: AuditSystemComponent,
    title: 'Auditoría del Sistema'
  },
  {
    path: 'admin/academic-config',
    component: AcademicConfigComponent,
    title: 'Configuración Académica'
  },

  { path: 'periodos-academicos', loadComponent: () => import('./components/academic-periods/academic-periods.component').then(m => m.AcademicPeriodsComponent) },
  { path: 'repositorio', loadComponent: () => import('./components/repository/repository.component').then(m => m.RepositoryComponent) },
  
  { path: '**', redirectTo: '/dashboard' }
];