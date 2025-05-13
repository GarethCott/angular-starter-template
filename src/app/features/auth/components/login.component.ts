import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AmplifyService } from '../../../core/services/amplify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2 class="text-center text-2xl font-bold mb-5">Sign In</h2>
    
    <div *ngIf="errorMessage" class="alert alert-error mb-4">
      {{ errorMessage }}
    </div>
    
    <form (ngSubmit)="onSubmit()" class="space-y-4">
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
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  `
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