import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AmplifyService } from '../../../core/services/amplify.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <h2>Register</h2>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div *ngIf="!showConfirmation">
        <form (ngSubmit)="onRegister()">
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
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
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
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>
      </div>
      
      <div *ngIf="showConfirmation">
        <form (ngSubmit)="onConfirm()">
          <div class="form-group">
            <label for="code">Confirmation Code</label>
            <input 
              type="text" 
              id="code" 
              [(ngModel)]="confirmationCode" 
              name="code" 
              required
            />
            <small>Please check your email for the confirmation code</small>
          </div>
          
          <button type="submit" [disabled]="isConfirming">
            {{ isConfirming ? 'Confirming...' : 'Confirm Registration' }}
          </button>
        </form>
      </div>
      
      <div class="login-link">
        <a routerLink="/login">Already have an account? Login here</a>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
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
    
    small {
      display: block;
      margin-top: 5px;
      color: #666;
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
      width: 100%;
    }
    
    button:disabled {
      background-color: #cccccc;
    }
    
    .error-message {
      color: red;
      margin-bottom: 15px;
    }
    
    .success-message {
      color: green;
      margin-bottom: 15px;
    }
    
    .login-link {
      margin-top: 15px;
      text-align: center;
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmationCode = '';
  
  isLoading = false;
  isConfirming = false;
  showConfirmation = false;
  
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private amplifyService: AmplifyService,
    private router: Router
  ) {}
  
  onRegister(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.amplifyService.signUp(this.username, this.password, this.email)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.showConfirmation = true;
          this.successMessage = 'Registration successful! Please check your email for a confirmation code.';
        },
        error: (error) => {
          this.isLoading = false;
          if (error.code === 'UsernameExistsException') {
            this.errorMessage = 'Username is already taken';
          } else if (error.code === 'InvalidPasswordException') {
            this.errorMessage = 'Password does not meet requirements';
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
            console.error('Registration error:', error);
          }
        }
      });
  }
  
  onConfirm(): void {
    if (!this.confirmationCode) {
      this.errorMessage = 'Please enter the confirmation code';
      return;
    }
    
    this.isConfirming = true;
    this.errorMessage = '';
    
    this.amplifyService.confirmSignUp(this.username, this.confirmationCode)
      .subscribe({
        next: () => {
          this.isConfirming = false;
          this.successMessage = 'Account confirmed successfully! Redirecting to login...';
          
          // Navigate to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isConfirming = false;
          if (error.code === 'CodeMismatchException') {
            this.errorMessage = 'Invalid confirmation code';
          } else if (error.code === 'ExpiredCodeException') {
            this.errorMessage = 'Confirmation code has expired';
          } else {
            this.errorMessage = 'Confirmation failed. Please try again.';
            console.error('Confirmation error:', error);
          }
        }
      });
  }
} 