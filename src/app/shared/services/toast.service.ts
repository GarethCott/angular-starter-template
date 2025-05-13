import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StateFacadeService } from '../../core/services/state-facade.service';
import { Notification } from '../../core/services/state.service';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
  position: ToastPosition;
  showClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Map state notifications to toast format
  public toasts$: Observable<Toast[]>;
  private defaultDuration = 3000;
  private defaultPosition: ToastPosition = 'top-right';

  constructor(private stateFacade: StateFacadeService) {
    // Transform state notifications to toast format
    this.toasts$ = this.stateFacade.getNotifications().pipe(
      map(notifications => notifications
        .filter(notification => !notification.read)
        .map(this.convertNotificationToToast.bind(this))
      )
    );
  }

  /**
   * Convert a state notification to a toast format
   */
  private convertNotificationToToast(notification: Notification): Toast {
    return {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      duration: this.defaultDuration,
      position: this.defaultPosition,
      showClose: true
    };
  }

  /**
   * Show a toast notification
   */
  show(
    message: string, 
    type: ToastType = 'info', 
    options: {
      title?: string,
      duration?: number,
      position?: ToastPosition,
      showClose?: boolean
    } = {}
  ): string {
    // Create a notification in the global state
    const notification = this.stateFacade.notify(message, type);
    
    // Auto-remove toast after duration
    const duration = options.duration || this.defaultDuration;
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Show an info toast
   */
  info(message: string, options: any = {}): string {
    return this.show(message, 'info', options);
  }

  /**
   * Show a success toast
   */
  success(message: string, options: any = {}): string {
    return this.show(message, 'success', options);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options: any = {}): string {
    return this.show(message, 'warning', options);
  }

  /**
   * Show an error toast
   */
  error(message: string, options: any = {}): string {
    return this.show(message, 'error', options);
  }

  /**
   * Remove a specific toast by ID
   */
  remove(id: string): void {
    // Mark notification as read in global state
    this.stateFacade.markNotificationAsRead(id);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    // Clear notifications in global state
    this.stateFacade.clearNotifications();
  }
} 