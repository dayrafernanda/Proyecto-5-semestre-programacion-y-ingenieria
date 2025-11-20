import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  user: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '' as UserRole,
    studentId: '',
    specialization: '',
    department: ''
  };
  
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.user.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Simular registro (en una app real, esto haría una llamada HTTP)
    const newUser: User = {
      id: Date.now().toString(),
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      role: this.user.role,
      studentId: this.user.studentId || undefined,
      specialization: this.user.specialization || undefined,
      department: this.user.department || undefined,
      isActive: true,
      createdAt: new Date()
    };

    // Guardar en localStorage (simulación)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto-login después del registro
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('token', 'simulated-token-' + Date.now());

    // Redirigir según el rol
    this.redirectByRole(newUser.role);
  }

  private redirectByRole(role: UserRole) {
    switch (role) {
      case 'student':
        this.router.navigate(['/dashboard']);
        break;
      case 'teacher':
        this.router.navigate(['/dashboard']);
        break;
      case 'coordinator':
        this.router.navigate(['/dashboard']);
        break;
      case 'tutor':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}
