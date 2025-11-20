import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  const requiredRoles = route.data?.['roles'] as string[];

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // Si no tiene el rol requerido, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};
