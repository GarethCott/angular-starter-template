import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    CommonModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-starter-template';
  
  navItems = [
    { name: 'Home', route: '/' },
    { name: 'Components', route: '/components' },
    { name: 'Profile', route: '/profile' },
    { name: 'Login', route: '/login' },
    { name: 'Register', route: '/register' }
  ];
}
