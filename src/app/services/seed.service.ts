import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SeedService {
  constructor() {
    this.initializeSampleUsers();
  }

  private initializeSampleUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Solo crear usuarios de prueba si no existen
    if (users.length === 0) {
      const sampleUsers: User[] = [
        {
          id: '1',
          firstName: 'Admin',
          lastName: 'Sistema',
          email: 'admin@sistema.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '2',
          firstName: 'María',
          lastName: 'González',
          email: 'estudiante@email.com',
          role: 'student',
          studentId: '2024001',
          specialization: 'Ingeniería de Software',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '3',
          firstName: 'Carlos',
          lastName: 'Mendoza',
          email: 'docente@email.com',
          role: 'teacher',
          department: 'Ingeniería de Sistemas',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '4',
          firstName: 'Ana',
          lastName: 'López',
          email: 'coordinador@email.com',
          role: 'coordinator',
          department: 'Coordinación Académica',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '5',
          firstName: 'Roberto',
          lastName: 'Sánchez',
          email: 'tutor@email.com',
          role: 'tutor',
          department: 'Tutorías',
          isActive: true,
          createdAt: new Date()
        }
      ];

      localStorage.setItem('users', JSON.stringify(sampleUsers));
      console.log('Usuarios de prueba creados automáticamente');
    }
  }
}
