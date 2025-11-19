import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, LoginCredentials, RegisterData, UserRole, ROLE_PERMISSIONS } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  private demoUsers: User[] = [
    // ESTUDIANTES
    {
      id: '1',
      username: 'estudiante',
      email: 'estudiante@institucion.edu.co',
      firstName: 'Ana',
      lastName: 'García',
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      studentId: '202310001'
    },
    {
      id: '2',
      username: 'estudiante2',
      email: 'estudiante2@institucion.edu.co',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      studentId: '202310002'
    },

    // DOCENTES
    {
      id: '3',
      username: 'docente',
      email: 'docente@institucion.edu.co',
      firstName: 'María',
      lastName: 'López',
      role: 'teacher',
      isActive: true,
      createdAt: new Date(),
      specialization: 'Desarrollo de Software'
    },
    {
      id: '4',
      username: 'docente2',
      email: 'docente2@institucion.edu.co',
      firstName: 'Roberto',
      lastName: 'Fernández',
      role: 'teacher',
      isActive: true,
      createdAt: new Date(),
      specialization: 'Redes y Telecomunicaciones'
    },

    // COORDINADORES
    {
      id: '5',
      username: 'coordinador',
      email: 'coordinador@institucion.edu.co',
      firstName: 'Laura',
      lastName: 'Martínez',
      role: 'coordinator',
      isActive: true,
      createdAt: new Date()
    },

    // ADMINISTRADORES
    {
      id: '6',
      username: 'admin',
      email: 'admin@institucion.edu.co',
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    },

    // TUTORES
    {
      id: '7',
      username: 'tutor',
      email: 'tutor@institucion.edu.co',
      firstName: 'David',
      lastName: 'Gómez',
      role: 'tutor',
      isActive: true,
      createdAt: new Date(),
      specialization: 'Metodologías Ágiles'
    }
  ];

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentUserPermissions() {
    const user = this.currentUserValue;
    return user ? ROLE_PERMISSIONS[user.role] : null;
  }

  login(credentials: LoginCredentials): Observable<User> {
    return of(credentials).pipe(
      map(cred => {
        const user = this.demoUsers.find(u => 
          u.username === cred.username && 
          this.validatePassword(cred.username, cred.password)
        );

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        const userWithToken = {
          ...user,
          token: 'demo-token-' + user.id
        };

        localStorage.setItem('currentUser', JSON.stringify(userWithToken));
        this.currentUserSubject.next(userWithToken);
        return userWithToken;
      })
    );
  }

  private validatePassword(username: string, password: string): boolean {
    return password === username;
  }

  register(userData: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  hasPermission(permission: keyof typeof ROLE_PERMISSIONS.student): boolean {
    const permissions = this.currentUserPermissions;
    return permissions ? permissions[permission] : false;
  }

  isInRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }
}
