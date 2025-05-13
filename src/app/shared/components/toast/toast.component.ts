import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast, ToastPosition } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;
  private groupedToastsCache: { [key in ToastPosition]?: Toast[] } | null = null;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Subscribe to toasts from the service (which now uses state management)
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      // Always invalidate cache when toasts change
      this.groupedToastsCache = null;
      
      // Only update and trigger change detection if the toasts array actually changed
      if (JSON.stringify(this.toasts) !== JSON.stringify(toasts)) {
        this.toasts = toasts;
        this.cdr.markForCheck(); // Explicitly mark for change detection
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  /**
   * Remove a specific toast
   */
  remove(id: string): void {
    this.toastService.remove(id);
  }

  /**
   * Get the daisyUI toast position classes
   */
  getToastPositionClasses(position: string): string {
    switch (position) {
      case 'top-left':
        return 'toast-top toast-start';
      case 'top-center':
        return 'toast-top toast-center';
      case 'top-right':
        return 'toast-top toast-end';
      case 'bottom-left':
        return 'toast-bottom toast-start';
      case 'bottom-center':
        return 'toast-bottom toast-center';
      case 'bottom-right':
      default:
        return 'toast-bottom toast-end';
    }
  }

  /**
   * Get the alert class based on toast type
   */
  getAlertClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'error':
        return 'alert-error';
      case 'info':
      default:
        return 'alert-info';
    }
  }

  /**
   * Get the icon path based on toast type
   */
  getIconPath(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  /**
   * Group toasts by position with caching to prevent unnecessary recalculations
   */
  getGroupedToasts(): { [key in ToastPosition]?: Toast[] } {
    // Use cached result if available and toasts haven't changed
    if (this.groupedToastsCache) {
      return this.groupedToastsCache;
    }
    
    // Otherwise, calculate the grouped toasts
    const grouped: { [key in ToastPosition]?: Toast[] } = {};
    
    this.toasts.forEach(toast => {
      if (!grouped[toast.position]) {
        grouped[toast.position] = [];
      }
      grouped[toast.position]!.push(toast);
    });
    
    // Cache the result
    this.groupedToastsCache = grouped;
    return grouped;
  }
} 