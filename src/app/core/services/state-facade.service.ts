import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StateService, Notification } from './state.service';

/**
 * State Facade Service
 * Provides a simplified API for components to interact with the application state
 * Follows the Facade pattern to abstract state management details
 */
@Injectable({
  providedIn: 'root'
})
export class StateFacadeService {

  constructor(private stateService: StateService) { }

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
  notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Notification {
    return this.stateService.addNotification(message, type);
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
  
  /**
   * Reset the entire state
   */
  resetState(): void {
    this.stateService.resetState();
  }
} 