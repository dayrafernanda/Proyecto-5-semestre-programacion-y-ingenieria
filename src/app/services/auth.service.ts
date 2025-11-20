import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): boolean {
    // Simular verificación de credenciales
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      // En una app real, verificaríamos la contraseña con el backend
      // Por ahora, aceptamos cualquier contraseña para usuarios existentes
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', 'simulated-token');
      this.currentUserSubject.next(user);
      return true;
    }
    
    return false;
  }

  register(user: User): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar si el usuario ya existe
    if (users.find((u: User) => u.email === user.email)) {
      return false;
    }

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Método para compatibilidad con código existente
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
