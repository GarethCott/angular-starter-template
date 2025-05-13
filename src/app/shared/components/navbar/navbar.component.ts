import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

interface NavItem {
  name: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <div class="navbar bg-base-100">
      <div class="flex-none">
        <label for="my-drawer-3" class="btn btn-square btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div> 
      <div class="flex-1">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 mr-2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <a class="btn btn-ghost text-xl">{{ title }}</a>
        </div>
      </div>
      <div class="flex-none hidden lg:block">
        <ul class="menu menu-horizontal px-1">
          <li *ngFor="let item of navItems">
            <a [routerLink]="item.route" routerLinkActive="active">
              {{ item.name }}
            </a>
          </li>
        </ul>
      </div>
      <div class="flex-none">
        <!-- Theme Toggle Component -->
        <app-theme-toggle></app-theme-toggle>
      </div>
    </div>
  `,
})
export class NavbarComponent {
  @Input() title: string = 'App Title';
  @Input() navItems: NavItem[] = [];
} 