import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  department: string;
  lastLogin: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  
  users: User[] = [
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@universidad.edu',
      role: 'Docente',
      status: 'active',
      department: 'Ingeniería de Sistemas',
      lastLogin: new Date('2024-01-15'),
      createdAt: new Date('2023-08-10')
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@universidad.edu',
      role: 'Administrador',
      status: 'active',
      department: 'Administración',
      lastLogin: new Date('2024-01-16'),
      createdAt: new Date('2023-06-15')
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana.martinez@universidad.edu',
      role: 'Estudiante',
      status: 'active',
      department: 'Medicina',
      lastLogin: new Date('2024-01-14'),
      createdAt: new Date('2024-01-05')
    },
    {
      id: 4,
      name: 'Roberto Silva',
      email: 'roberto.silva@universidad.edu',
      role: 'Docente',
      status: 'inactive',
      department: 'Matemáticas',
      lastLogin: new Date('2023-12-20'),
      createdAt: new Date('2023-09-12')
    },
    {
      id: 5,
      name: 'Laura Mendoza',
      email: 'laura.mendoza@universidad.edu',
      role: 'Estudiante',
      status: 'pending',
      department: 'Derecho',
      lastLogin: new Date('2024-01-10'),
      createdAt: new Date('2024-01-08')
    }
  ];

  filteredUsers: User[] = [];
  searchQuery: string = '';
  selectedRole: string = 'all';
  selectedStatus: string = 'all';
  
  newUser: Partial<User> = {
    name: '',
    email: '',
    role: 'Estudiante',
    status: 'pending',
    department: ''
  };

  showUserModal: boolean = false;
  isEditing: boolean = false;
  editingUserId: number | null = null;

  roles: string[] = ['Estudiante', 'Docente', 'Administrador', 'Coordinador'];
  departments: string[] = [
    'Ingeniería de Sistemas',
    'Medicina',
    'Derecho',
    'Matemáticas',
    'Administración',
    'Psicología',
    'Economía'
  ];

  ngOnInit() {
    this.filteredUsers = [...this.users];
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchQuery || 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  openNewUserModal() {
    this.isEditing = false;
    this.editingUserId = null;
    this.newUser = {
      name: '',
      email: '',
      role: 'Estudiante',
      status: 'pending',
      department: ''
    };
    this.showUserModal = true;
  }

  openEditUserModal(user: User) {
    this.isEditing = true;
    this.editingUserId = user.id;
    this.newUser = { ...user };
    this.showUserModal = true;
  }

  closeModal() {
    this.showUserModal = false;
    this.resetForm();
  }

  saveUser() {
    if (this.isEditing && this.editingUserId) {
      const index = this.users.findIndex(u => u.id === this.editingUserId);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...this.newUser };
      }
    } else {
      const newUser: User = {
        id: Math.max(...this.users.map(u => u.id)) + 1,
        name: this.newUser.name!,
        email: this.newUser.email!,
        role: this.newUser.role!,
        status: this.newUser.status!,
        department: this.newUser.department!,
        lastLogin: new Date(),
        createdAt: new Date()
      };
      this.users.unshift(newUser);
    }

    this.applyFilters();
    this.showUserModal = false;
    this.resetForm();
  }

  deleteUser(userId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.applyFilters();
    }
  }

  resetForm() {
    this.newUser = {
      name: '',
      email: '',
      role: 'Estudiante',
      status: 'pending',
      department: ''
    };
    this.isEditing = false;
    this.editingUserId = null;
  }

  isFormValid(): boolean {
    return !!(this.newUser.name && this.newUser.email && this.newUser.department);
  }

  getActiveUsersCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  getPendingUsersCount(): number {
    return this.users.filter(u => u.status === 'pending').length;
  }

  getTeachersCount(): number {
    return this.users.filter(u => u.role === 'Docente').length;
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'pending': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Administrador': return 'bg-danger';
      case 'Docente': return 'bg-primary';
      case 'Coordinador': return 'bg-info';
      case 'Estudiante': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}