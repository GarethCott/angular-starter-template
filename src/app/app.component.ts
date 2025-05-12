import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-starter-template';
  
  navItems = [
    { name: 'Home', route: '/' },
    { name: 'Profile', route: '/profile' },
    { name: 'Login', route: '/login' },
    { name: 'Register', route: '/register' }
  ];
}
