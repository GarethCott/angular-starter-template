import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StateFacadeService } from '../../../core/services/state-facade.service';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="flex flex-col items-center">
        <div class="loading loading-spinner loading-lg text-primary"></div>
        <span class="mt-4 text-white">Loading...</span>
      </div>
    </div>
  `,
  styles: []
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  isLoading = false;
  private subscription: Subscription | null = null;

  constructor(private stateFacade: StateFacadeService) { }

  ngOnInit(): void {
    // Subscribe to loading state from global state management
    this.subscription = this.stateFacade.isLoading().subscribe(
      isLoading => this.isLoading = isLoading
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
} 