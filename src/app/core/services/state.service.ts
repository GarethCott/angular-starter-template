import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

/**
 * Global application state interface
 */
export interface AppState {
  user: {
    isAuthenticated: boolean;
    userId?: string;
    username?: string;
    roles?: string[];
  };
  ui: {
    theme: string;
    notifications: Notification[];
    isLoading: boolean;
    lastViewedPage: string;
  };
  [key: string]: any; // Allow for dynamic state slices
}

/**
 * Notification interface for app-wide notifications
 */
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

/**
 * Global State Management Service
 * Provides a centralized store for application state using RxJS
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Initial state
  private initialState: AppState = {
    user: {
      isAuthenticated: false
    },
    ui: {
      theme: 'light',
      notifications: [],
      isLoading: false,
      lastViewedPage: ''
    }
  };

  // BehaviorSubject containing the application state
  private state$ = new BehaviorSubject<AppState>(this.initialState);

  constructor() { 
    // Initialize with stored theme if available
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      this.updateState({
        ui: {
          ...this.getCurrentState().ui,
          theme: storedTheme
        }
      });
    }
  }

  /**
   * Get the current state snapshot
   */
  getCurrentState(): AppState {
    return this.state$.getValue();
  }

  /**
   * Get the state as an observable
   */
  getState(): Observable<AppState> {
    return this.state$.asObservable();
  }

  /**
   * Select a slice of the state
   * @param selector Function to select a part of the state
   * @returns Observable of the selected state slice
   */
  select<T>(selector: (state: AppState) => T): Observable<T> {
    return this.getState().pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  /**
   * Update the state
   * @param partialState Partial state to merge with current state
   */
  updateState(partialState: Partial<AppState>): void {
    const currentState = this.getCurrentState();
    const newState = this.deepMerge(currentState, partialState);
    this.state$.next(newState);
  }

  /**
   * Reset the state to initial values
   */
  resetState(): void {
    this.state$.next(this.initialState);
  }

  /**
   * Update user authentication state
   * @param isAuthenticated Whether the user is authenticated
   * @param userData Optional user data
   */
  setAuthState(isAuthenticated: boolean, userData?: { userId?: string, username?: string, roles?: string[] }): void {
    this.updateState({
      user: {
        isAuthenticated,
        ...userData
      }
    });
  }

  /**
   * Set the current theme
   * @param theme Theme name
   */
  setTheme(theme: string): void {
    localStorage.setItem('theme', theme);
    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        theme
      }
    });
  }

  /**
   * Get the current theme
   * @returns Observable of the current theme
   */
  getTheme(): Observable<string> {
    return this.select(state => state.ui.theme);
  }

  /**
   * Add a notification
   * @param message Notification message
   * @param type Notification type
   * @returns The created notification
   */
  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Notification {
    const notifications = [...this.getCurrentState().ui.notifications];
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
      read: false
    };

    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        notifications: [...notifications, newNotification]
      }
    });

    return newNotification;
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   */
  markNotificationAsRead(id: string): void {
    const notifications = this.getCurrentState().ui.notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );

    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        notifications
      }
    });
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        notifications: []
      }
    });
  }

  /**
   * Get all notifications
   * @returns Observable of notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.select(state => state.ui.notifications);
  }

  /**
   * Set loading state
   * @param isLoading Whether the app is in a loading state
   */
  setLoading(isLoading: boolean): void {
    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        isLoading
      }
    });
  }

  /**
   * Get loading state
   * @returns Observable of the loading state
   */
  getLoading(): Observable<boolean> {
    return this.select(state => state.ui.isLoading);
  }

  /**
   * Set the last viewed page
   * @param page Page path
   */
  setLastViewedPage(page: string): void {
    this.updateState({
      ui: {
        ...this.getCurrentState().ui,
        lastViewedPage: page
      }
    });
  }

  /**
   * Get the last viewed page
   * @returns Observable of the last viewed page
   */
  getLastViewedPage(): Observable<string> {
    return this.select(state => state.ui.lastViewedPage);
  }

  /**
   * Helper method to deep merge objects
   * @param target Target object
   * @param source Source object to merge
   * @returns New merged object
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }
}

/**
 * Helper function to check if a value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
} 