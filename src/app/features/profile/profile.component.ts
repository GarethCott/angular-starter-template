import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AmplifyService } from '../../core/services/amplify.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">User Profile</h2>
      
      <div *ngIf="loading" class="text-gray-600">
        Loading user profile...
      </div>
      
      <div *ngIf="error" class="text-red-500 mb-4">
        {{ error }}
      </div>
      
      <form *ngIf="profileForm && !loading" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-2">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input 
            type="text" 
            id="username" 
            formControlName="username" 
            readonly
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none"
          >
        </div>
        
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email" 
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
            Please enter a valid email address.
          </div>
        </div>
        
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" 
            id="name" 
            formControlName="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <button 
          type="submit" 
          [disabled]="profileForm.invalid || saving"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private amplifyService: AmplifyService
  ) {}
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  private loadUserProfile(): void {
    this.loading = true;
    this.amplifyService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          // Create form with user attributes
          this.profileForm = this.fb.group({
            username: [user.username, Validators.required],
            email: [user.attributes?.email, [Validators.required, Validators.email]],
            name: [user.attributes?.name || '']
          });
        } else {
          this.error = 'Unable to load user profile';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading profile: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (!this.profileForm || this.profileForm.invalid) {
      return;
    }
    
    this.saving = true;
    
    // Update user attributes implementation here
    // This would call Amplify's updateUserAttributes API
    
    // Simulating API call for now
    setTimeout(() => {
      this.saving = false;
      console.log('Profile would be updated with:', this.profileForm?.value);
    }, 1000);
  }
} 