import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { 
  AppState, 
  Notification, 
  UserState, 
  UIState, 
  PreferencesState,
  FiltersState
} from '../../models/state.model';
import { RouterState } from './route-state.service';

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
      lastViewedPage: '',
      sidebarCollapsed: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        inApp: true
      }
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
        },
        preferences: {
          ...this.getCurrentState().preferences!,
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
      },
      preferences: {
        ...this.getCurrentState().preferences!,
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
   * @param metadata Optional metadata for the notification
   * @returns The created notification
   */
  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', metadata?: any): Notification {
    const notifications = [...this.getCurrentState().ui.notifications];
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
      read: false,
      metadata
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
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    const currentState = this.getCurrentState();
    const currentlyCollapsed = currentState.ui.sidebarCollapsed ?? false;
    
    this.updateState({
      ui: {
        ...currentState.ui,
        sidebarCollapsed: !currentlyCollapsed
      }
    });
  }

  /**
   * Get sidebar collapsed state
   * @returns Observable of the sidebar collapsed state
   */
  getSidebarCollapsed(): Observable<boolean> {
    return this.select(state => state.ui.sidebarCollapsed ?? false);
  }

  /**
   * Update user preferences
   * @param preferences Partial preferences to update
   */
  updatePreferences(preferences: Partial<PreferencesState>): void {
    this.updateState({
      preferences: {
        ...this.getCurrentState().preferences!,
        ...preferences
      }
    });
  }

  /**
   * Get user preferences
   * @returns Observable of user preferences
   */
  getPreferences(): Observable<PreferencesState | undefined> {
    return this.select(state => state.preferences);
  }

  /**
   * Deep merge two objects
   * @param target Target object
   * @param source Source object to merge into target
   * @returns Merged object
   */
  private deepMerge(target: any, source: any): any {
    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = sourceValue;
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = this.deepMerge({ ...targetValue }, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }
}

/**
 * Helper function to check if a value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
} 