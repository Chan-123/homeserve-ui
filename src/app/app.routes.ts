import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { CustomerHome } from './pages/customer-home/customer-home';
import { EngineerDashboard } from './pages/engineer-dashboard/engineer-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'unauthorized', component: Unauthorized },
  {
    path: 'customer/home',
    component: CustomerHome,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CUSTOMER'] }
  },
  {
    path: 'engineer/dashboard',
    component: EngineerDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ENGINEER'] }
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];