import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { ApolloGraphqlService } from './apollo-graphql.service';
import { StateFacadeService } from './state-facade.service';
import { User } from '../models/user.model';
import { GET_USER, LIST_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../../graphql/graphql.schema';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // In-memory cache for users
  private userCache: Map<string, User> = new Map();
  
  constructor(
    private apolloService: ApolloGraphqlService,
    private stateFacade: StateFacadeService
  ) {}

  /**
   * Get a user by ID with caching
   */
  getUser(id: string): Observable<User> {
    // Try to get from cache first
    const cachedUser = this.userCache.get(id);
    if (cachedUser) {
      return of(cachedUser);
    }
    
    // If not in cache, fetch from API
    return this.apolloService.query<{ getUser: User }>({
      query: GET_USER,
      variables: { id }
    }).pipe(
      map(result => result.getUser),
      tap(user => {
        // Cache the result
        if (user) {
          this.userCache.set(id, user);
        }
      }),
      catchError(error => {
        this.stateFacade.notify(`Error fetching user: ${error.message}`, 'error');
        throw error;
      })
    );
  }

  /**
   * Get all users
   */
  getUsers(): Observable<{ items: User[] }> {
    return this.apolloService.query<{ listUsers: { items: User[] } }>({
      query: LIST_USERS
    }).pipe(
      map(result => result.listUsers),
      tap(result => {
        // Cache individual users
        if (result && result.items) {
          result.items.forEach(user => {
            if (user.id) {
              this.userCache.set(user.id, user);
            }
          });
        }
      }),
      catchError(error => {
        this.stateFacade.notify(`Error fetching users: ${error.message}`, 'error');
        throw error;
      })
    );
  }

  /**
   * Create a new user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.apolloService.mutate<{ createUser: User }>(CREATE_USER, {
      input: user
    }).pipe(
      map(result => result.createUser),
      tap(createdUser => {
        // Cache the new user
        if (createdUser && createdUser.id) {
          this.userCache.set(createdUser.id, createdUser);
        }
        this.stateFacade.notify('User created successfully', 'success');
      }),
      catchError(error => {
        this.stateFacade.notify(`Error creating user: ${error.message}`, 'error');
        throw error;
      })
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.apolloService.mutate<{ updateUser: User }>(UPDATE_USER, {
      input: {
        id,
        ...user
      }
    }).pipe(
      map(result => result.updateUser),
      tap(updatedUser => {
        // Update the cache
        if (updatedUser && updatedUser.id) {
          this.userCache.set(updatedUser.id, updatedUser);
        }
        this.stateFacade.notify('User updated successfully', 'success');
      }),
      catchError(error => {
        this.stateFacade.notify(`Error updating user: ${error.message}`, 'error');
        throw error;
      })
    );
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<User> {
    return this.apolloService.mutate<{ deleteUser: User }>(DELETE_USER, {
      input: { id }
    }).pipe(
      map(result => result.deleteUser),
      tap(deletedUser => {
        // Remove from cache
        if (deletedUser && deletedUser.id) {
          this.userCache.delete(deletedUser.id);
        }
        this.stateFacade.notify('User deleted successfully', 'success');
      }),
      catchError(error => {
        this.stateFacade.notify(`Error deleting user: ${error.message}`, 'error');
        throw error;
      })
    );
  }
  
  /**
   * Clear user cache
   */
  clearCache(): void {
    this.userCache.clear();
  }

  /**
   * Get current authenticated user details
   * This fetches the user details for the currently logged in user
   */
  getCurrentUserDetails(): Observable<User> {
    return this.stateFacade.isAuthenticated().pipe(
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this.stateFacade.notify('User is not authenticated', 'error');
          throw new Error('User is not authenticated');
        }
        
        return this.stateFacade.getUsername().pipe(
          switchMap(username => {
            if (!username) {
              throw new Error('Username not available');
            }
            
            // Query for user by username
            return this.apolloService.query<{ getUserByUsername: User }>({
              query: GET_USER, // Adjust this query for fetching by username
              variables: { username }
            }).pipe(
              map(result => result.getUserByUsername),
              tap(user => {
                if (user && user.id) {
                  this.userCache.set(user.id, user);
                }
              })
            );
          })
        );
      }),
      catchError(error => {
        this.stateFacade.notify(`Error fetching current user: ${error.message}`, 'error');
        throw error;
      })
    );
  }
} 