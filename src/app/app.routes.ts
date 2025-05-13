import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  // Auth routes with AuthLayout
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login.component')
          .then(c => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register.component')
          .then(c => c.RegisterComponent)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./features/auth/components/unauthorized.component')
          .then(c => c.UnauthorizedComponent)
      },
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      }
    ]
  },
  
  // Main application routes with MainLayout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
          .then(c => c.HomeComponent)
      },
      {
        path: 'profile', 
        canActivate: [AuthGuard],
        loadComponent: () => import('./features/profile/profile.component')
          .then(c => c.ProfileComponent)
      },
      {
        path: 'components',
        loadComponent: () => import('./shared/components/daisy-showcase.component')
          .then(c => c.DaisyShowcaseComponent)
      }
      // Dashboard and admin components will be implemented later
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
