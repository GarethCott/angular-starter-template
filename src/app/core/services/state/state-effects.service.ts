import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, pairwise, map } from 'rxjs/operators';
import { StateService } from './state.service';
import { Notification } from '../../models/state.model';

/**
 * Service for handling side effects triggered by state changes
 * Implements patterns similar to NgRx Effects but with simpler RxJS approach
 */
@Injectable({
  providedIn: 'root'
})
export class StateEffectsService implements OnDestroy {
  private subscription = new Subscription();
  
  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.initializeEffects();
  }
  
  /**
   * Initialize all state effects
   */
  private initializeEffects(): void {
    // Handle auth state changes
    this.subscription.add(
      this.stateService.select(state => state.user.isAuthenticated).pipe(
        distinctUntilChanged(),
        pairwise() // Get previous and current value
      ).subscribe(([wasAuthenticated, isAuthenticated]) => {
        if (wasAuthenticated && !isAuthenticated) {
          // User logged out, redirect to login page
          this.router.navigate(['/auth/login']);
          
          // Clear sensitive data
          this.stateService.updateState({
            user: {
              isAuthenticated: false,
              userId: undefined,
              username: undefined,
              roles: undefined
            }
          });
          
          // Log analytics event - you would implement this in a real app
          console.log('Analytics: User logged out');
        }
        
        if (!wasAuthenticated && isAuthenticated) {
          // User logged in, redirect to home or last page
          const lastViewedPage = this.stateService.getCurrentState().ui.lastViewedPage;
          if (lastViewedPage && lastViewedPage !== '/auth/login') {
            this.router.navigateByUrl(lastViewedPage);
          } else {
            this.router.navigate(['/']);
          }
          
          // Log analytics event - you would implement this in a real app
          console.log('Analytics: User logged in');
        }
      })
    );
    
    // Track page views for analytics
    this.subscription.add(
      this.stateService.select(state => state.ui.lastViewedPage).pipe(
        distinctUntilChanged(),
        filter(page => !!page && page !== '/auth/login') // Skip empty pages and login page
      ).subscribe(page => {
        // Log page view - you would implement real analytics in a production app
        console.log(`Analytics: Page viewed - ${page}`);
      })
    );
    
    // Handle global errors effect
    this.subscription.add(
      this.stateService.select(state => state.ui.notifications).pipe(
        distinctUntilChanged(),
        // Get the latest notification
        map((notifications: Notification[]) => notifications.length > 0 ? notifications[notifications.length - 1] : null),
        filter((notification: Notification | null): notification is Notification => notification !== null && notification.type === 'error')
      ).subscribe(errorNotification => {
        // Log errors to monitoring service
        console.error(`Error notification: ${errorNotification.message}`);
        // You would implement real error logging here
      })
    );
  }
  
  /**
   * Clean up all subscriptions when service is destroyed
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
} 