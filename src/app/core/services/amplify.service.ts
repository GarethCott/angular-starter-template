import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmplifyService {
  private authenticationSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  constructor() {
    // Initialize Amplify with configuration from environment - Auth only
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: environment.amplify.userPoolId,
          userPoolClientId: environment.amplify.userPoolWebClientId,
          identityPoolId: environment.amplify.identityPoolId
        }
      }
      // GraphQL API config moved to Apollo service
    });
    
    // Check if user is already authenticated
    this.checkAuthStatus();
    // Setup token refresh mechanism
    this.setupTokenRefresh();
  }
  
  /**
   * Check if a user is currently authenticated
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      this.authenticationSubject.next(session.tokens !== undefined);
    } catch {
      this.authenticationSubject.next(false);
    }
  }
  
  /**
   * Setup automatic token refresh to maintain authentication
   */
  private setupTokenRefresh(): void {
    // Check token expiration and refresh before it expires
    const refreshInterval = setInterval(async () => {
      try {
        // Get current session and check if token needs refresh
        const session = await this.getAuthSession();
        if (session && session.tokens) {
          const expirationTime = session.tokens.idToken.payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeToExpire = expirationTime - currentTime;
          
          // If token expires in less than 10 minutes (600000ms), refresh it
          if (timeToExpire < 600000) {
            await fetchAuthSession();
            console.log('Auth session refreshed');
          }
        }
      } catch (error) {
        console.error('Error in token refresh:', error);
      }
    }, 300000); // Check every 5 minutes
  }
  
  /**
   * Get current authentication session - useful for adding auth tokens to GraphQL requests
   */
  async getAuthSession(): Promise<any> {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('Error getting auth session:', error);
      return null;
    }
  }
  
  /**
   * Sign in a user with their username and password
   */
  signIn(username: string, password: string): Observable<any> {
    return from(signIn({ username, password }));
  }
  
  /**
   * Sign up a new user
   */
  signUp(username: string, password: string, email: string): Observable<any> {
    return from(signUp({
      username,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    }));
  }
  
  /**
   * Confirm sign up with verification code
   */
  confirmSignUp(username: string, code: string): Observable<any> {
    return from(confirmSignUp({ username, confirmationCode: code }));
  }
  
  /**
   * Sign out the current user
   */
  signOut(): Observable<any> {
    return from(signOut());
  }
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Observable<any> {
    return from(getCurrentUser());
  }
  
  /**
   * Get the authentication state as an Observable
   */
  isAuthenticated(): Observable<boolean> {
    return this.authenticationSubject.asObservable();
  }
} 