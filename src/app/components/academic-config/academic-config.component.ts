import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface AcademicPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'upcoming';
}

interface SystemParameter {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  category: string;
  description: string;
  options?: string[];
}

@Component({
  selector: 'app-academic-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './academic-config.component.html',
  styleUrl: './academic-config.component.scss'
})
export class AcademicConfigComponent implements OnInit {

  activeTab: string = 'periods';
  
  // Configuración de Periodos Académicos
  academicPeriods: AcademicPeriod[] = [
    {
      id: 1,
      name: 'Primer Semestre 2024',
      startDate: '2024-01-15',
      endDate: '2024-06-20',
      status: 'upcoming'
    },
    {
      id: 2,
      name: 'Segundo Semestre 2023',
      startDate: '2023-07-10',
      endDate: '2023-12-15',
      status: 'active'
    },
    {
      id: 3,
      name: 'Primer Semestre 2023',
      startDate: '2023-01-16',
      endDate: '2023-06-20',
      status: 'inactive'
    }
  ];

  newPeriod: Partial<AcademicPeriod> = {
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming'
  };

  showPeriodModal: boolean = false;
  isEditingPeriod: boolean = false;

  // Configuración de Parámetros del Sistema
  systemParameters: SystemParameter[] = [
    {
      key: 'max_file_size',
      value: 50,
      type: 'number',
      category: 'Archivos',
      description: 'Tamaño máximo de archivo en MB'
    },
    {
      key: 'session_timeout',
      value: 30,
      type: 'number',
      category: 'Seguridad',
      description: 'Tiempo de expiración de sesión en minutos'
    },
    {
      key: 'allow_registration',
      value: true,
      type: 'boolean',
      category: 'Usuarios',
      description: 'Permitir registro de nuevos usuarios'
    },
    {
      key: 'default_user_role',
      value: 'Estudiante',
      type: 'select',
      category: 'Usuarios',
      description: 'Rol por defecto para nuevos usuarios',
      options: ['Estudiante', 'Docente', 'Invitado']
    },
    {
      key: 'backup_frequency',
      value: 'daily',
      type: 'select',
      category: 'Sistema',
      description: 'Frecuencia de backups automáticos',
      options: ['daily', 'weekly', 'monthly']
    }
  ];

  categories: string[] = ['Archivos', 'Seguridad', 'Usuarios', 'Sistema', 'Académico'];

  ngOnInit() {}

  // Métodos para Periodos Académicos
  openNewPeriodModal() {
    this.isEditingPeriod = false;
    this.newPeriod = {
      name: '',
      startDate: '',
      endDate: '',
      status: 'upcoming'
    };
    this.showPeriodModal = true;
  }

  openEditPeriodModal(period: AcademicPeriod) {
    this.isEditingPeriod = true;
    this.newPeriod = { ...period };
    this.showPeriodModal = true;
  }

  savePeriod() {
    if (this.isEditingPeriod && this.newPeriod.id) {
      const index = this.academicPeriods.findIndex(p => p.id === this.newPeriod.id);
      if (index !== -1) {
        this.academicPeriods[index] = { ...this.academicPeriods[index], ...this.newPeriod };
      }
    } else {
      const newPeriod: AcademicPeriod = {
        id: Math.max(...this.academicPeriods.map(p => p.id)) + 1,
        name: this.newPeriod.name!,
        startDate: this.newPeriod.startDate!,
        endDate: this.newPeriod.endDate!,
        status: this.newPeriod.status!
      };
      this.academicPeriods.unshift(newPeriod);
    }
    this.showPeriodModal = false;
  }

  deletePeriod(periodId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este periodo académico?')) {
      this.academicPeriods = this.academicPeriods.filter(p => p.id !== periodId);
    }
  }

  closePeriodModal() {
    this.showPeriodModal = false;
  }

  // Métodos para Parámetros del Sistema
  saveParameters() {
    alert('Configuraciones guardadas exitosamente');
    // Aquí iría la lógica para guardar en el backend
  }

  resetParameters() {
    if (confirm('¿Restaurar valores por defecto? Se perderán los cambios no guardados.')) {
      // Recargar parámetros por defecto
      this.systemParameters = [
        {
          key: 'max_file_size',
          value: 50,
          type: 'number',
          category: 'Archivos',
          description: 'Tamaño máximo de archivo en MB'
        },
        {
          key: 'session_timeout',
          value: 30,
          type: 'number',
          category: 'Seguridad',
          description: 'Tiempo de expiración de sesión en minutos'
        },
        {
          key: 'allow_registration',
          value: true,
          type: 'boolean',
          category: 'Usuarios',
          description: 'Permitir registro de nuevos usuarios'
        },
        {
          key: 'default_user_role',
          value: 'Estudiante',
          type: 'select',
          category: 'Usuarios',
          description: 'Rol por defecto para nuevos usuarios',
          options: ['Estudiante', 'Docente', 'Invitado']
        },
        {
          key: 'backup_frequency',
          value: 'daily',
          type: 'select',
          category: 'Sistema',
          description: 'Frecuencia de backups automáticos',
          options: ['daily', 'weekly', 'monthly']
        }
      ];
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'upcoming': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'upcoming': return 'Próximo';
      default: return status;
    }
  }

  isPeriodFormValid(): boolean {
    return !!(this.newPeriod.name && this.newPeriod.startDate && this.newPeriod.endDate);
  }
}