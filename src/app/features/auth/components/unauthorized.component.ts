import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-md mx-auto mt-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-center text-2xl font-bold mb-4">Unauthorized Access</h2>
          
          <div class="text-center py-6">
            <div class="text-error text-5xl mb-4">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p class="text-lg mb-8">You do not have permission to access this resource.</p>
            <div class="flex justify-center gap-4">
              <button class="btn btn-primary" (click)="goToDashboard()">Go to Dashboard</button>
              <button class="btn btn-secondary" (click)="goToHome()">Go to Home</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  
  goToHome(): void {
    this.router.navigate(['/']);
  }
} 