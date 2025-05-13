import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ContainerComponent } from '../../shared/components/container/container.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    FooterComponent,
    ContainerComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Auth Header -->
      <header class="py-4 bg-base-100">
        <app-container [size]="'full'" [padding]="'sm'">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">Angular Starter Template</h1>
            <a routerLink="/home" class="btn btn-ghost btn-sm">Go to App</a>
          </div>
        </app-container>
      </header>

      <!-- Main Content -->
      <main class="flex-grow py-8">
        <app-container [size]="'lg'" [padding]="'md'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <!-- Left Side - Image and Text -->
            <div class="hidden md:block">
              <div class="text-center mb-6">
                <img src="assets/images/auth-illustration.svg" alt="Authentication" class="max-w-xs mx-auto mb-6" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Welcome'; this.className='max-w-xs mx-auto mb-6 rounded-lg shadow-md'">
                <h2 class="text-2xl font-bold mb-3">Welcome to Angular Starter</h2>
                <p class="text-base-content/70">A complete solution for your Angular application with authentication, GraphQL, and more.</p>
              </div>
              <div class="bg-base-200 p-6 rounded-lg shadow-sm mt-6">
                <h3 class="font-bold mb-2">Features</h3>
                <ul class="list-disc list-inside space-y-1 text-base-content/70">
                  <li>Angular Standalone Components</li>
                  <li>AWS Amplify Authentication</li>
                  <li>Apollo GraphQL Integration</li>
                  <li>daisyUI & Tailwind CSS</li>
                  <li>Responsive Layout System</li>
                </ul>
              </div>
            </div>
            
            <!-- Right Side - Auth Forms -->
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body">
                <router-outlet></router-outlet>
                
                <!-- Auth Navigation -->
                <div class="divider mt-4">OR</div>
                <div class="flex justify-center space-x-4">
                  <a routerLink="/login" class="link link-primary">Login</a>
                  <a routerLink="/register" class="link link-secondary">Register</a>
                </div>
              </div>
            </div>
          </div>
        </app-container>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `
})
export class AuthLayoutComponent {} 