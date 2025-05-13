import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AmplifyService } from '../../../core/services/amplify.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2 class="text-center text-2xl font-bold mb-5">Create Account</h2>
    
    <div *ngIf="errorMessage" class="alert alert-error mb-4">
      {{ errorMessage }}
    </div>
    
    <div *ngIf="successMessage" class="alert alert-success mb-4">
      {{ successMessage }}
    </div>
    
    <div *ngIf="!showConfirmation">
      <form (ngSubmit)="onRegister()" class="space-y-4">
        <div class="form-control">
          <label for="username" class="label">
            <span class="label-text">Username</span>
          </label>
          <input 
            type="text" 
            id="username" 
            [(ngModel)]="username" 
            name="username" 
            required
            class="input input-bordered w-full"
          />
        </div>
        
        <div class="form-control">
          <label for="email" class="label">
            <span class="label-text">Email</span>
          </label>
          <input 
            type="email" 
            id="email" 
            [(ngModel)]="email" 
            name="email" 
            required
            class="input input-bordered w-full"
          />
        </div>
        
        <div class="form-control">
          <label for="password" class="label">
            <span class="label-text">Password</span>
          </label>
          <input 
            type="password" 
            id="password" 
            [(ngModel)]="password" 
            name="password" 
            required
            class="input input-bordered w-full"
          />
        </div>
        
        <button type="submit" [disabled]="isLoading" class="btn btn-primary w-full mt-4">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
    
    <div *ngIf="showConfirmation">
      <form (ngSubmit)="onConfirm()" class="space-y-4">
        <div class="form-control">
          <label for="code" class="label">
            <span class="label-text">Confirmation Code</span>
          </label>
          <input 
            type="text" 
            id="code" 
            [(ngModel)]="confirmationCode" 
            name="code" 
            required
            class="input input-bordered w-full"
          />
          <label class="label">
            <span class="label-text-alt">Please check your email for the confirmation code</span>
          </label>
        </div>
        
        <button type="submit" [disabled]="isConfirming" class="btn btn-primary w-full mt-4">
          {{ isConfirming ? 'Confirming...' : 'Confirm Registration' }}
        </button>
      </form>
    </div>
  `
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
          this.successMessage = 'Account confirmed successfully! You can now login.';
          // Redirect to login page after a short delay
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
            this.errorMessage = 'Failed to confirm account. Please try again.';
            console.error('Confirmation error:', error);
          }
        }
      });
  }
} 