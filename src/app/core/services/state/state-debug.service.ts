import { Injectable, isDevMode } from '@angular/core';
import { pairwise } from 'rxjs/operators';
import { StateService } from './state.service';
import { AppState } from '../../models/state.model';

/**
 * Service providing debugging tools for state management
 * Only active in development mode
 */
@Injectable({
  providedIn: 'root'
})
export class StateDebugService {
  private stateHistory: Array<{
    timestamp: number;
    action: string;
    state: Partial<AppState>;
    changes: Record<string, any>;
  }> = [];
  
  constructor(private stateService: StateService) {
    if (isDevMode()) {
      this.setupDebugTools();
    }
  }
  
  /**
   * Setup all debugging tools and state monitoring
   */
  private setupDebugTools(): void {
    // Monitor all state changes with diff tracking
    this.stateService.getState().pipe(
      pairwise() // Get previous and current state
    ).subscribe(([prevState, newState]) => {
      // Find what changed between states
      const changes = this.getStateChanges(prevState, newState);
      const changeKeys = Object.keys(changes);
      
      // Log changes to console with nice formatting
      if (changeKeys.length > 0) {
        console.group('%c State Updated', 'color: #9E9E9E; font-weight: bold');
        console.log('%c Previous State', 'color: #9E9E9E', prevState);
        console.log('%c Changes', 'color: #4CAF50; font-weight: bold', changes);
        console.log('%c Current State', 'color: #03A9F4; font-weight: bold', newState);
        console.groupEnd();
        
        // Store in history for time-travel debugging
        this.stateHistory.push({
          timestamp: Date.now(),
          action: `State updated: ${changeKeys.join(', ')}`,
          state: { ...newState },
          changes
        });
        
        // Limit history size to prevent memory issues
        if (this.stateHistory.length > 50) {
          this.stateHistory.shift();
        }
      }
    });
    
    // Expose debug helpers to window object in dev mode
    this.exposeGlobalHelpers();
  }
  
  /**
   * Expose debug methods to window object
   */
  private exposeGlobalHelpers(): void {
    const globalAny = window as any;
    
    globalAny.__STATE__ = {
      // Get current state
      getState: () => this.stateService.getCurrentState(),
      
      // Get state history
      getHistory: () => this.stateHistory,
      
      // Reset to initial state
      resetState: () => this.stateService.resetState(),
      
      // Update state (for testing)
      updateState: (partialState: Partial<AppState>) => this.stateService.updateState(partialState),
      
      // Time travel to specific history point
      timeTravel: (index: number) => {
        if (index >= 0 && index < this.stateHistory.length) {
          this.stateService.updateState(this.stateHistory[index].state);
          return true;
        }
        return false;
      },
      
      // Print available actions
      help: () => {
        console.group('State Debug Tools');
        console.log('__STATE__.getState() - Get current state');
        console.log('__STATE__.getHistory() - Get state change history');
        console.log('__STATE__.resetState() - Reset to initial state');
        console.log('__STATE__.updateState(partialState) - Update state');
        console.log('__STATE__.timeTravel(index) - Jump to specific state in history');
        console.groupEnd();
      }
    };
    
    console.log('%c State Debug Tools Available', 'background: #222; color: #bada55', 
      'Type __STATE__.help() for available commands');
  }
  
  /**
   * Compare states to find what changed
   */
  private getStateChanges(prevState: AppState, newState: AppState): Record<string, any> {
    const changes: Record<string, any> = {};
    
    // Compare top-level keys
    Object.keys(newState).forEach(key => {
      if (JSON.stringify(prevState[key]) !== JSON.stringify(newState[key])) {
        changes[key] = newState[key];
      }
    });
    
    return changes;
  }
} 