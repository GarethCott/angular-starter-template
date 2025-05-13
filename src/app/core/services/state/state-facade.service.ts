import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StateService } from './state.service';
import { 
  Notification, 
  PreferencesState, 
  FiltersState, 
  UserProfile 
} from '../../models/state.model';
import { Router, NavigationExtras } from '@angular/router';
import { RouterState } from './route-state.service';

/**
 * State Facade Service
 * Provides a simplified API for components to interact with the application state
 * Follows the Facade pattern to abstract state management details
 */
@Injectable({
  providedIn: 'root'
})
export class StateFacadeService {

  constructor(
    private stateService: StateService,
    private router: Router
  ) { }

  // User state methods
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.stateService.select(state => state.user.isAuthenticated);
  }
  
  /**
   * Get user roles
   */
  getUserRoles(): Observable<string[] | undefined> {
    return this.stateService.select(state => state.user.roles);
  }
  
  /**
   * Get username
   */
  getUsername(): Observable<string | undefined> {
    return this.stateService.select(state => state.user.username);
  }

  /**
   * Get user profile
   */
  getUserProfile(): Observable<UserProfile | undefined> {
    return this.stateService.select(state => state.user.profile);
  }
  
  /**
   * Set user authentication status
   */
  setAuthenticated(isAuthenticated: boolean, userData?: { userId?: string, username?: string, roles?: string[] }): void {
    this.stateService.setAuthState(isAuthenticated, userData);
  }
  
  /**
   * Sign user out
   */
  signOut(): void {
    this.stateService.setAuthState(false);
  }
  
  // UI state methods
  
  /**
   * Get current theme
   */
  getTheme(): Observable<string> {
    return this.stateService.getTheme();
  }
  
  /**
   * Set application theme
   */
  setTheme(theme: string): void {
    this.stateService.setTheme(theme);
  }
  
  /**
   * Add a notification
   */
  notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', metadata?: any): Notification {
    return this.stateService.addNotification(message, type, metadata);
  }
  
  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.stateService.getNotifications();
  }
  
  /**
   * Mark notification as read
   */
  markNotificationAsRead(id: string): void {
    this.stateService.markNotificationAsRead(id);
  }
  
  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.stateService.clearNotifications();
  }
  
  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.stateService.setLoading(isLoading);
  }
  
  /**
   * Get loading state
   */
  isLoading(): Observable<boolean> {
    return this.stateService.getLoading();
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.stateService.toggleSidebar();
  }

  /**
   * Get sidebar collapsed state
   */
  isSidebarCollapsed(): Observable<boolean> {
    return this.stateService.getSidebarCollapsed();
  }
  
  /**
   * Set last viewed page
   */
  setLastViewedPage(page: string): void {
    this.stateService.setLastViewedPage(page);
  }
  
  /**
   * Get last viewed page
   */
  getLastViewedPage(): Observable<string> {
    return this.stateService.getLastViewedPage();
  }

  // Preferences state methods

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<PreferencesState>): void {
    this.stateService.updatePreferences(preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences(): Observable<PreferencesState | undefined> {
    return this.stateService.getPreferences();
  }
  
  // Route state methods

  /**
   * Navigate to route and update state
   */
  navigateTo(path: string, extras?: NavigationExtras): Promise<boolean> {
    this.setLastViewedPage(path);
    return this.router.navigate([path], extras);
  }

  /**
   * Navigate with custom data in state
   */
  navigateWithData(path: string, data: any, extras?: NavigationExtras): Promise<boolean> {
    this.setLastViewedPage(path);
    this.stateService.updateState({
      router: {
        ...this.stateService.getCurrentState()['router'] as RouterState,
        customData: data
      }
    });
    return this.router.navigate([path], extras);
  }

  /**
   * Get current route state
   */
  getCurrentRoute(): Observable<RouterState | undefined> {
    return this.stateService.select(state => state['router'] as RouterState | undefined);
  }

  /**
   * Get route custom data
   */
  getRouteData(): Observable<any> {
    return this.stateService.select(state => {
      const routerState = state['router'] as RouterState | undefined;
      return routerState?.customData;
    });
  }

  /**
   * Update URL query parameters without navigation
   */
  updateQueryParams(params: any): Promise<boolean> {
    return this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
      relativeTo: this.router.routerState.root,
      replaceUrl: true
    });
  }
  
  /**
   * Reset the entire state
   */
  resetState(): void {
    this.stateService.resetState();
  }
} 