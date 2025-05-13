import { Injectable, inject } from '@angular/core';
import { skip, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { StateService } from './state.service';
import { AppState } from '../../models/state.model';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

/**
 * Service for persisting and restoring application state
 * Handles saving state to localStorage and hydrating state on application startup
 */
@Injectable({
  providedIn: 'root'
})
export class StatePersistenceService {
  private stateSubscription: Subscription | null = null;
  private platformId = inject(DOCUMENT).defaultView ? true : false;
  
  constructor(private stateService: StateService) {
    // Restore state from localStorage on initialization
    this.hydrateState();
    
    // Subscribe to state changes to persist them
    if (this.isBrowser()) {
      this.stateSubscription = this.stateService.getState().pipe(
        skip(1), // Skip initial state
        debounceTime(300) // Avoid excessive writes
      ).subscribe(state => this.persistState(state));
    }
  }
  
  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return this.platformId;
  }
  
  /**
   * Persist selected parts of the state to localStorage
   * Only stores non-sensitive data that should be remembered between sessions
   */
  private persistState(state: AppState): void {
    if (!this.isBrowser()) return;
    
    try {
      // Select only the parts of the state that should be persisted
      const stateToPersist = {
        ui: {
          theme: state.ui.theme,
          lastViewedPage: state.ui.lastViewedPage
        }
        // Add other non-sensitive state slices as needed
      };
      
      localStorage.setItem('appState', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Failed to persist state', error);
    }
  }
  
  /**
   * Restore state from localStorage on application startup
   */
  private hydrateState(): void {
    if (!this.isBrowser()) return;
    
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.stateService.updateState(parsedState);
      }
    } catch (error) {
      console.error('Failed to hydrate state', error);
    }
  }
  
  /**
   * Manually persist current state
   * Useful for immediately saving important state changes
   */
  saveState(): void {
    if (!this.isBrowser()) return;
    
    this.persistState(this.stateService.getCurrentState());
  }
  
  /**
   * Clear persisted state
   * Useful for logout or resetting user preferences
   */
  clearPersistedState(): void {
    if (!this.isBrowser()) return;
    
    localStorage.removeItem('appState');
  }
} 