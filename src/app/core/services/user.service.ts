import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApolloGraphqlService } from './apollo-graphql.service';
import { User } from '../models/user.model';
import { GET_USER, LIST_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../../graphql/graphql.schema';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apolloService: ApolloGraphqlService) {}

  /**
   * Get a user by ID
   */
  getUser(id: string): Observable<User> {
    return this.apolloService.query<{ getUser: User }>({
      query: GET_USER,
      variables: { id }
    }).pipe(
      map(result => result.getUser)
    );
  }

  /**
   * Get all users
   */
  getUsers(): Observable<{ items: User[] }> {
    return this.apolloService.query<{ listUsers: { items: User[] } }>({
      query: LIST_USERS
    }).pipe(
      map(result => result.listUsers)
    );
  }

  /**
   * Create a new user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.apolloService.mutate<{ createUser: User }>(CREATE_USER, {
      input: user
    }).pipe(
      map(result => result.createUser)
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
      map(result => result.updateUser)
    );
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<User> {
    return this.apolloService.mutate<{ deleteUser: User }>(DELETE_USER, {
      input: { id }
    }).pipe(
      map(result => result.deleteUser)
    );
  }
} 