import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface AuditLog {
  id: number;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'success' | 'error' | 'warning';
  details: string;
}

@Component({
  selector: 'app-audit-system',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './audit-system.component.html',
  styleUrl: './audit-system.component.scss'
})
export class AuditSystemComponent implements OnInit {

  auditLogs: AuditLog[] = [
    {
      id: 1,
      timestamp: new Date('2024-01-16T10:30:00'),
      user: 'admin@universidad.edu',
      action: 'LOGIN',
      module: 'Autenticación',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'Inicio de sesión exitoso'
    },
    {
      id: 2,
      timestamp: new Date('2024-01-16T10:25:00'),
      user: 'maria.gonzalez@universidad.edu',
      action: 'CREATE_USER',
      module: 'Gestión de Usuarios',
      ipAddress: '192.168.1.150',
      status: 'success',
      details: 'Usuario creado: carlos.rodriguez@universidad.edu'
    },
    {
      id: 3,
      timestamp: new Date('2024-01-16T10:20:00'),
      user: 'ana.martinez@universidad.edu',
      action: 'UPLOAD_FILE',
      module: 'Repositorio',
      ipAddress: '192.168.1.200',
      status: 'error',
      details: 'Error al subir archivo: tamaño excedido'
    },
    {
      id: 4,
      timestamp: new Date('2024-01-16T10:15:00'),
      user: 'roberto.silva@universidad.edu',
      action: 'DELETE_RECORD',
      module: 'Base de Datos',
      ipAddress: '192.168.1.175',
      status: 'warning',
      details: 'Eliminación de registro de proyecto'
    },
    {
      id: 5,
      timestamp: new Date('2024-01-16T10:10:00'),
      user: 'system',
      action: 'BACKUP',
      module: 'Sistema',
      ipAddress: '127.0.0.1',
      status: 'success',
      details: 'Backup completado exitosamente'
    }
  ];

  filteredLogs: AuditLog[] = [];
  searchQuery: string = '';
  selectedModule: string = 'all';
  selectedStatus: string = 'all';
  dateRange: { start: string; end: string } = { start: '', end: '' };

  modules: string[] = ['Autenticación', 'Gestión de Usuarios', 'Repositorio', 'Base de Datos', 'Sistema', 'Seguridad'];

  ngOnInit() {
    this.filteredLogs = [...this.auditLogs];
  }

  applyFilters() {
    this.filteredLogs = this.auditLogs.filter(log => {
      const matchesSearch = !this.searchQuery || 
        log.user.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesModule = this.selectedModule === 'all' || log.module === this.selectedModule;
      const matchesStatus = this.selectedStatus === 'all' || log.status === this.selectedStatus;

      let matchesDate = true;
      if (this.dateRange.start) {
        matchesDate = matchesDate && new Date(log.timestamp) >= new Date(this.dateRange.start);
      }
      if (this.dateRange.end) {
        matchesDate = matchesDate && new Date(log.timestamp) <= new Date(this.dateRange.end);
      }

      return matchesSearch && matchesModule && matchesStatus && matchesDate;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedModule = 'all';
    this.selectedStatus = 'all';
    this.dateRange = { start: '', end: '' };
    this.applyFilters();
  }

  exportLogs() {
    alert('Funcionalidad de exportación en desarrollo');
  }

  getStats() {
    return {
      total: this.auditLogs.length,
      success: this.auditLogs.filter(log => log.status === 'success').length,
      errors: this.auditLogs.filter(log => log.status === 'error').length,
      warnings: this.auditLogs.filter(log => log.status === 'warning').length
    };
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      default: return status;
    }
  }

  now(): Date {
    return new Date();
  }
}