import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private toasts: BehaviorSubject<Toast[]> = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toasts.asObservable();

  constructor() { }

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
    const id = this.generateId();
    const toast: Toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      showClose: options.showClose !== undefined ? options.showClose : true
    };

    this.toasts.next([...this.toasts.getValue(), toast]);

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration);
    }

    return id;
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
    const currentToasts = this.toasts.getValue();
    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts.next([]);
  }

  /**
   * Generate a random ID for the toast
   */
  private generateId(): string {
    return `toast-${Math.random().toString(36).substring(2, 9)}`;
  }
} 