import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to access this resource.</p>
      <div class="actions">
        <button (click)="goToDashboard()">Go to Dashboard</button>
        <button (click)="goToHome()">Go to Home</button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      max-width: 600px;
      margin: 100px auto;
      padding: 30px;
      text-align: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      color: #dc3545;
      margin-bottom: 20px;
    }
    
    p {
      color: #6c757d;
      font-size: 18px;
      margin-bottom: 30px;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;
    }
    
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #0069d9;
    }
  `]
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