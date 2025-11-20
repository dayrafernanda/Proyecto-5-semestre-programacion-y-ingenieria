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

  login(identifier: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const user = users.find((u: User) => {
      if (u.email.toLowerCase() === identifier.toLowerCase()) {
        return true;
      }
      
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (fullName === identifier.toLowerCase()) {
        return true;
      }
      
      const fullNameNoSpace = `${u.firstName}${u.lastName}`.toLowerCase();
      if (fullNameNoSpace === identifier.toLowerCase()) {
        return true;
      }
      
      return false;
    });
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', 'simulated-token');
      this.currentUserSubject.next(user);
      return true;
    }
    
    return false;
  }

  register(user: User): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email.toLowerCase() === user.email.toLowerCase())) {
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

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
