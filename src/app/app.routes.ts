import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/components/login.component';
import { RegisterComponent } from './features/auth/components/register.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  /* Temporarily commented out until dashboard component is implemented
  { 
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module')
      .then(m => m.DashboardModule)
  },
  */
  {
    path: 'profile', 
    canActivate: [AuthGuard],
    component: ProfileComponent
  },
//   {
//     path: 'admin',
//     canActivate: [AuthGuard, RoleGuard],
//     loadChildren: () => import('./features/admin/admin.module')
//       .then(m => m.AdminModule)
//   },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/components/unauthorized.component')
      .then(c => c.UnauthorizedComponent)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
