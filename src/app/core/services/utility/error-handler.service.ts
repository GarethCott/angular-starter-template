import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { StateFacadeService } from '../state/state-facade.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(
    private router: Router,
    private stateFacade: StateFacadeService
  ) {}
  
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // Handle HTTP errors from REST endpoints
      this.handleHttpError(error);
    } else {
      // Handle client-side or network errors
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      // Network error or server not responding
      console.error('Network error or server not responding:', error);
      this.stateFacade.notify('Network connection error. Please check your internet connection and try again.', 'error');
    } else if (error.status === 401) {
      // Unauthorized, redirect to login
      console.error('Unauthorized access:', error);
      this.stateFacade.notify('Your session has expired. Please sign in again.', 'warning');
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      // Forbidden, redirect to unauthorized page
      console.error('Forbidden access:', error);
      this.stateFacade.notify('You do not have permission to access this resource.', 'error');
      this.router.navigate(['/unauthorized']);
    } else if (error.status >= 500) {
      // Server error
      console.error('Server error:', error);
      this.stateFacade.notify('Server error occurred. Please try again later.', 'error');
    } else {
      // Other HTTP errors
      console.error(`HTTP Error ${error.status}:`, error.message);
      this.stateFacade.notify(`Error: ${error.error?.message || error.message || 'Unknown error'}`, 'error');
    }
  }

  private handleClientError(error: Error): void {
    // Handle client-side errors
    console.error('Application error:', error);
    this.stateFacade.notify(`Application error: ${error.message}`, 'error');
  }
} 