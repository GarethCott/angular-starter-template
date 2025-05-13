import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ContainerComponent, ContentCardComponent } from '../../shared/components/layout';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ContainerComponent,
    ContentCardComponent
  ],
  template: `
    <!-- Main Application Layout with Drawer -->
     <app-container [size]="'full'" [padding]="'sm'">
    <div class="drawer">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" /> 
      <div class="drawer-content flex flex-col">
        <!-- Navbar -->
        <app-navbar [title]="title" [navItems]="navItems"></app-navbar>

        <!-- Main Content -->
        <main class="min-h-screen py-6">
          <app-container [size]="'lg'" [padding]="'md'">
            <!-- Router Outlet -->
            <app-content-card>
              <router-outlet></router-outlet>
            </app-content-card>
          </app-container>
        </main>

        <!-- Footer -->
        <app-footer></app-footer>
      </div> 
      <div class="drawer-side">
        <label for="my-drawer-3" class="drawer-overlay"></label> 
        <ul class="menu p-4 w-80 min-h-full bg-base-200">
          <li *ngFor="let item of navItems">
            <a [routerLink]="item.route" routerLinkActive="active">
              {{ item.name }}
            </a>
          </li>
          
          <li class="menu-title mt-4">
            <span>Authentication</span>
          </li>
          <li><a routerLink="/login">Login</a></li>
          <li><a routerLink="/register">Register</a></li>
        </ul>
      </div>
    </div>
    </app-container>
  `
})
export class MainLayoutComponent {
  title = 'angular-starter-template';
  
  navItems = [
    { name: 'Home', route: '/home' },
    { name: 'Components', route: '/components' },
    { name: 'Profile', route: '/profile' },
    { name: 'Login', route: '/login' },
    { name: 'Register', route: '/register' }
  ];
} 