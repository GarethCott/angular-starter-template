import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StateFacadeService } from '../state/state-facade.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmplifyService {
  constructor(private stateFacade: StateFacadeService) {
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
      const isAuthenticated = session.tokens !== undefined;
      
      if (isAuthenticated) {
        // Get the user details if authenticated
        const user = await getCurrentUser();
        
        // Get roles from the token payload if available
        const roles: string[] = this.extractRolesFromSession(session);
        
        // Update auth state with user information
        this.stateFacade.setAuthenticated(true, {
          userId: user.userId,
          username: user.username,
          roles
        });
      } else {
        this.stateFacade.setAuthenticated(false);
      }
    } catch {
      this.stateFacade.setAuthenticated(false);
    }
  }
  
  /**
   * Extract roles from the Cognito session
   */
  private extractRolesFromSession(session: any): string[] {
    try {
      const cognitoGroups = session.tokens?.idToken?.payload?.['cognito:groups'];
      
      if (!cognitoGroups) {
        return [];
      }
      
      if (Array.isArray(cognitoGroups)) {
        return cognitoGroups.map(group => String(group));
      }
      
      // If it's not an array but exists, convert to string and wrap in array
      return [String(cognitoGroups)];
    } catch (error) {
      console.error('Error extracting roles from session:', error);
      return [];
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
    return from(signIn({ username, password })).pipe(
      tap(async (result) => {
        if (result && result.isSignedIn) {
          // Update auth state after successful sign in
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          
          // Get roles from the token payload
          const roles = this.extractRolesFromSession(session);
          
          this.stateFacade.setAuthenticated(true, {
            userId: user.userId,
            username: user.username,
            roles
          });
          
          // Show success notification
          this.stateFacade.notify('Successfully signed in', 'success');
        }
      })
    );
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
    })).pipe(
      tap(() => {
        // Show success notification
        this.stateFacade.notify('Sign up successful! Please check your email for confirmation code', 'success');
      })
    );
  }
  
  /**
   * Confirm sign up with verification code
   */
  confirmSignUp(username: string, code: string): Observable<any> {
    return from(confirmSignUp({ username, confirmationCode: code })).pipe(
      tap(() => {
        // Show success notification
        this.stateFacade.notify('Account confirmed successfully! You can now sign in', 'success');
      })
    );
  }
  
  /**
   * Sign out the current user
   */
  signOut(): Observable<any> {
    return from(signOut()).pipe(
      tap(() => {
        // Reset authentication state
        this.stateFacade.setAuthenticated(false);
        
        // Show notification
        this.stateFacade.notify('You have been signed out', 'info');
      })
    );
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
    return this.stateFacade.isAuthenticated();
  }
} 