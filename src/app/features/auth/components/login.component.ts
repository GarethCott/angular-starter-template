import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AmplifyService } from '../../../core/services/amplify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            [(ngModel)]="username" 
            name="username" 
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            [(ngModel)]="password" 
            name="password" 
            required
          />
        </div>
        <button type="submit" [disabled]="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
        <div class="register-link">
          <a routerLink="/register">Don't have an account? Register here</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
    }
    
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    button {
      padding: 10px 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      background-color: #cccccc;
    }
    
    .error-message {
      color: red;
      margin-bottom: 15px;
    }
    
    .register-link {
      margin-top: 15px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private amplifyService: AmplifyService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.amplifyService.signIn(this.username, this.password)
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Navigate to home or dashboard after successful login
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          // Handle different error cases
          if (error.code === 'UserNotConfirmedException') {
            this.errorMessage = 'Please confirm your account first';
          } else if (error.code === 'NotAuthorizedException') {
            this.errorMessage = 'Incorrect username or password';
          } else {
            this.errorMessage = 'An error occurred during sign in';
            console.error('Sign in error:', error);
          }
        }
      });
  }
} 