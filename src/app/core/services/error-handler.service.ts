import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private router: Router) {}
  
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
    } else if (error.status === 401) {
      // Unauthorized, redirect to login
      console.error('Unauthorized access:', error);
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      // Forbidden, redirect to unauthorized page
      console.error('Forbidden access:', error);
      this.router.navigate(['/unauthorized']);
    } else if (error.status >= 500) {
      // Server error
      console.error('Server error:', error);
      // You could show a user-friendly error modal here
    } else {
      // Other HTTP errors
      console.error(`HTTP Error ${error.status}:`, error.message);
    }
  }

  private handleClientError(error: Error): void {
    // Handle client-side errors
    console.error('Application error:', error);
    // You could show a user-friendly error modal here
  }
} 