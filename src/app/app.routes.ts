import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },

  {
  path: 'register',
  loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'nuevo-proyecto',
    loadComponent: () =>
      import('./components/project-form/project-form.component').then(
        (m) => m.ProjectFormComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'mi-portafolio',
    loadComponent: () =>
      import('./components/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'mis-entregas',
    loadComponent: () =>
      import('./components/deliveries/deliveries.component').then(
        (m) => m.DeliveriesComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'revisar-proyectos',
    loadComponent: () =>
      import('./components/project-review/project-review.component').then(
        (m) => m.ProjectReviewComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher', 'tutor'] },
  },
  {
    path: 'proyectos-asignados',
    loadComponent: () =>
      import('./components/assigned-projects/assigned-projects.component').then(
        (m) => m.AssignedProjectsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher', 'tutor'] },
  },
  {
    path: 'calificaciones',
    loadComponent: () =>
      import('./components/grades/grades.component').then(
        (m) => m.GradesComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher', 'tutor'] },
  },
  {
    path: 'rubricas',
    loadComponent: () =>
      import('./components/rubrics/rubrics.component').then(
        (m) => m.RubricsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher', 'tutor'] },
  },

  {
    path: 'auditoria',
    loadComponent: () =>
      import('./components/audit/audit.component').then(
        (m) => m.AuditComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['coordinator'] },
  },
  {
    path: 'periodos-academicos',
    loadComponent: () =>
      import('./components/academic-periods/academic-periods.component').then(
        (m) => m.AcademicPeriodsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['coordinator'] },
  },
  {
    path: 'asignacion-docentes',
    loadComponent: () =>
      import('./components/teacher-assignment/teacher-assignment.component').then(
        (m) => m.TeacherAssignmentComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['coordinator'] },
  },
  {
    path: 'reportes-institucionales',
    loadComponent: () =>
      import('./components/institutional-reports/institutional-reports.component').then(
        (m) => m.InstitutionalReportsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['coordinator'] },
  },

  {
    path: 'seguimiento-proyectos',
    loadComponent: () =>
      import('./components/project-tracking/project-tracking.component').then(
        (m) => m.ProjectTrackingComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tutor'] },
  },
  {
    path: 'retroalimentacion',
    loadComponent: () =>
      import('./components/feedback/feedback.component').then(
        (m) => m.FeedbackComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['tutor'] },
  },

  {
    path: 'user-management',
    loadComponent: () =>
      import('./components/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'audit-system',
    loadComponent: () =>
      import('./components/audit-system/audit-system.component').then(
        (m) => m.AuditSystemComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'academic-config',
    loadComponent: () =>
      import('./components/academic-config/academic-config.component').then(
        (m) => m.AcademicConfigComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports.component').then(
        (m) => m.ReportsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },

  {
    path: 'repositorio',
    loadComponent: () =>
      import('./components/repository/repository.component').then(
        (m) => m.RepositoryComponent
      ),
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: '/dashboard' },

  { 
    path: 'novedades', 
    loadChildren: () => import('./modules/novedades/novedades.module').then(m => m.NovedadesModule) 
  },
];
