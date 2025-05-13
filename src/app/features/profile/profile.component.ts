import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AmplifyService } from '../../core/services/amplify.service';
import { CommonModule } from '@angular/common';
import { PageLayoutComponent, ContentCardComponent } from '../../shared/components/layout';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageLayoutComponent, ContentCardComponent],
  template: `
    <app-page-layout title="User Profile">
      <app-content-card>
        <div *ngIf="loading" class="flex justify-center my-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        
        <div *ngIf="error" class="alert alert-error mb-4">
          {{ error }}
        </div>
        
        <form *ngIf="profileForm && !loading" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="form-control">
            <label for="username" class="label">
              <span class="label-text">Username</span>
            </label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              readonly
              class="input input-bordered bg-base-200"
            />
          </div>
          
          <div class="form-control">
            <label for="email" class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="input input-bordered"
            />
            <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="label">
              <span class="label-text-alt text-error">Please enter a valid email address.</span>
            </div>
          </div>
          
          <div class="form-control">
            <label for="name" class="label">
              <span class="label-text">Name</span>
            </label>
            <input 
              type="text" 
              id="name" 
              formControlName="name"
              class="input input-bordered"
            />
          </div>
          
          <button 
            type="submit" 
            [disabled]="profileForm.invalid || saving"
            class="btn btn-primary w-full mt-4"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </app-content-card>
    </app-page-layout>
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