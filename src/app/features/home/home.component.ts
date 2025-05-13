import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayoutComponent, ContentCardComponent, GridLayoutComponent } from '../../shared/components/layout';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    PageLayoutComponent, 
    ContentCardComponent, 
    GridLayoutComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Features data for the homepage
  features = [
    {
      title: 'Angular Standalone',
      description: 'Modern architecture with self-contained components',
      icon: 'module',
      color: 'primary'
    },
    {
      title: 'DaisyUI Components',
      description: 'Beautiful pre-built components with theming support',
      icon: 'palette',
      color: 'secondary'
    },
    {
      title: 'Responsive Design',
      description: 'Layouts that work perfectly on any device size',
      icon: 'devices',
      color: 'accent'
    }
  ];
  
  // Stats for the homepage
  stats = [
    { title: 'Components', value: '15+', icon: 'extension', description: 'Pre-built components' },
    { title: 'Performance', value: '95%', icon: 'speed', description: 'Lighthouse score' },
    { title: 'Customization', value: '100%', icon: 'tune', description: 'Customization options' }
  ];
  
  // Track docs section in view for animation
  isDocsSectionInView = false;
  
  // Navigate to documentation
  navigateToDocs(): void {
    console.log('Navigating to documentation');
    // Implement actual navigation
  }
  
  // Clone repository action
  cloneRepository(): void {
    window.open('https://github.com/yourusername/angular-starter-template', '_blank');
  }
} 