import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {

  systemStats = {
    totalUsers: 1248,
    activeProjects: 89,
    registeredTeachers: 67,
    systemEvents: 342
  };

  recentActivities = [
    {
      icon: 'bi-person-plus text-success',
      title: 'Nuevo usuario registrado',
      description: 'Dr. Roberto Martínez - Hace 5 minutos'
    },
    {
      icon: 'bi-shield-check text-primary',
      title: 'Backup del sistema completado',
      description: 'Proceso automático - Hace 2 horas'
    },
    {
      icon: 'bi-gear text-warning',
      title: 'Configuración actualizada',
      description: 'Parámetros académicos - Hace 4 horas'
    },
    {
      icon: 'bi-graph-up text-info',
      title: 'Reporte generado automáticamente',
      description: 'Estadísticas mensuales - Hace 6 horas'
    }
  ];

  systemAlerts = [
    {
      icon: 'bi-hdd text-warning',
      title: 'Espacio en disco',
      description: '75% utilizado - Considerar limpieza',
      severity: 'warning',
      badge: 'Medio'
    },
    {
      icon: 'bi-shield-exclamation text-success',
      title: 'Seguridad del sistema',
      description: 'Todos los sistemas operativos correctamente',
      severity: 'success',
      badge: 'OK'
    },
    {
      icon: 'bi-people text-info',
      title: 'Usuarios activos',
      description: '24 usuarios conectados actualmente',
      severity: 'info',
      badge: 'Normal'
    },
    {
      icon: 'bi-clock text-secondary',
      title: 'Próximo mantenimiento',
      description: 'Programado para el próximo sábado',
      severity: 'secondary',
      badge: 'Info'
    }
  ];

  modules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar cuentas de usuario, roles y permisos del sistema',
      icon: 'bi-people fa-2x text-primary',
      borderClass: 'border-left-primary',
      buttonClass: 'btn-primary',
      route: '/admin/users'
    },
    {
      title: 'Auditoría del Sistema',
      description: 'Monitoreo del sistema, logs de actividad y reportes de seguridad',
      icon: 'bi-shield-check fa-2x text-success',
      borderClass: 'border-left-success',
      buttonClass: 'btn-success',
      route: '/admin/audit'
    },
    {
      title: 'Configuración Académica',
      description: 'Configuración del sistema académico, periodos y parámetros generales',
      icon: 'bi-gear fa-2x text-info',
      borderClass: 'border-left-info',
      buttonClass: 'btn-info',
      route: '/admin/academic-config'
    },
    {
      title: 'Gestión de Proyectos',
      description: 'Administrar proyectos de grado, asignaciones y seguimiento',
      icon: 'bi-folder2-open fa-2x text-warning',
      borderClass: 'border-left-warning',
      buttonClass: 'btn-warning',
      route: '/admin/projects'
    },
    {
      title: 'Reportes y Análisis',
      description: 'Generar reportes estadísticos y análisis del sistema',
      icon: 'bi-graph-up fa-2x text-secondary',
      borderClass: 'border-left-secondary',
      buttonClass: 'btn-secondary',
      route: '/admin/reports'
    },
    {
      title: 'Sistema de Notificaciones',
      description: 'Gestionar notificaciones y comunicaciones del sistema',
      icon: 'bi-bell fa-2x text-danger',
      borderClass: 'border-left-danger',
      buttonClass: 'btn-danger',
      route: '/admin/notifications'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {}

  navigateTo(route: string): void {
    this.router.navigate([route]); 
  }

  getBadgeClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'warning': 'bg-warning',
      'success': 'bg-success',
      'info': 'bg-info',
      'secondary': 'bg-secondary',
      'danger': 'bg-danger'
    };
    return classes[severity] || 'bg-secondary';
  }
}
