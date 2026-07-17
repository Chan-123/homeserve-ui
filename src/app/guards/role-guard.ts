import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] || [];
  const userRole = auth.getRole();

  if (allowedRoles.includes(userRole)) return true;

  router.navigate(['/unauthorized']);
  return false;
};