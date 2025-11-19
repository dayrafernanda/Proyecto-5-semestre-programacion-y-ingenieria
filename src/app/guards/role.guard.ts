import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const currentUser = this.authService.currentUserValue;
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (requiredRoles.includes(currentUser.role)) {
      return true;
    }

    console.warn(`ACCESS DENIED: role "${currentUser.role}" cannot access this route.`);
    this.router.navigate(['/acceso-denegado']); 
    return false;
  }
}
