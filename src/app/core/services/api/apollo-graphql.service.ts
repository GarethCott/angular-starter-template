import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { WatchQueryOptions, OperationVariables } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { AmplifyService } from '../auth/amplify.service';
import { StateFacadeService } from '../state/state-facade.service';
import { environment } from '../../../../environments/environment';

/**
 * Service for handling Apollo GraphQL operations.
 * Provides methods for executing queries, mutations, and subscriptions.
 */
@Injectable({
  providedIn: 'root'
})
export class ApolloGraphqlService {
  private apollo: ApolloBase;

  constructor(
    private apolloProvider: Apollo,
    private httpLink: HttpLink,
    private amplifyService: AmplifyService,
    private stateFacade: StateFacadeService
  ) {
    this.apollo = this.apolloProvider.use('default');
    this.setupApolloClient();
  }

  private async setupApolloClient(): Promise<void> {
    // Create the http link to the GraphQL endpoint
    const httpLink = this.httpLink.create({
      uri: environment.graphql.endpoint
    });

    // Add authentication to requests
    const authLink = setContext(async (_, { headers }) => {
      try {
        // Get the current authentication session from Amplify
        const session = await this.amplifyService.getAuthSession();
        
        // If we have a token, add it to the headers
        if (session?.tokens?.idToken) {
          return {
            headers: {
              ...headers,
              Authorization: `Bearer ${session.tokens.idToken.toString()}`
            }
          };
        }
        
        return { headers };
      } catch (error) {
        console.error('Error setting auth context:', error);
        return { headers };
      }
    });

    // Create WebSocket link for subscriptions if enabled
    let link = authLink.concat(httpLink);

    // Configure WebSocket support for subscriptions if enabled in environment
    if (environment.features.enableSubscriptions && environment.graphql.webSocketEndpoint) {
      // Create a WebSocket link for subscription operations
      const wsClient = createClient({
        url: environment.graphql.webSocketEndpoint,
        connectionParams: async () => {
          try {
            const session = await this.amplifyService.getAuthSession();
            if (session?.tokens?.idToken) {
              return {
                Authorization: `Bearer ${session.tokens.idToken.toString()}`
              };
            }
            return {};
          } catch (error) {
            console.error('Error getting auth session for WebSocket:', error);
            return {};
          }
        }
      });

      const wsLink = new GraphQLWsLink(wsClient);

      // Split links based on operation type
      link = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        authLink.concat(httpLink)
      );
    }

    // Create the Apollo client options with improved caching
    const apolloOptions: ApolloClientOptions<any> = {
      link,
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              // Example for pagination caching
              paginatedItems: {
                keyArgs: ['filter'], // Cache separately based on 'filter' argument
                merge(existing = { items: [] }, incoming) {
                  return {
                    ...incoming,
                    items: [...existing.items, ...incoming.items],
                  };
                }
              }
            }
          }
        }
      }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network', // Use cache but also update from network
          errorPolicy: 'all'
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all'
        }
      }
    };

    // Register the client with Apollo
    this.apolloProvider.createNamed('default', apolloOptions);
  }

  /**
   * Handle GraphQL errors consistently
   * @param operation The GraphQL operation name
   * @param errors Array of GraphQL errors
   */
  handleGraphQLErrors(operation: string, errors: any[]): void {
    // Handle case of null or empty errors array
    if (!errors || errors.length === 0) {
      console.warn(`Empty errors array passed to handleGraphQLErrors for operation: ${operation}`);
      return;
    }
    
    // Log errors to monitoring service
    errors.forEach(error => {
      console.error(`[GraphQL error]: Operation: ${operation}, Message: ${error.message}`);
      
      // Notify user about the error
      this.stateFacade.notify(`GraphQL Error: ${error.message}`, 'error');
      
      // Handle specific error types
      if (error.extensions && error.extensions['code'] === 'UNAUTHENTICATED') {
        // Refresh tokens or redirect to login
        this.amplifyService.signOut().subscribe(() => {
          window.location.href = '/login';
        });
      }
      
      // Handle network errors differently from GraphQL errors
      if (error.networkError) {
        console.error('Network error', error.networkError);
        this.stateFacade.notify('Network error while connecting to the GraphQL server', 'error');
      }
    });
  }

  /**
   * Execute a GraphQL query and return the result
   * @param options The GraphQL query options
   * @returns An Observable of the query result
   */
  query<T = any>(options: WatchQueryOptions<OperationVariables, T>): Observable<T> {
    // Get the operation name for logging and tracking
    const operationName = this.getOperationName(options.query);
    
    // Set loading state
    this.stateFacade.setLoading(true);
    
    return this.apollo.watchQuery<T>(options)
      .valueChanges
      .pipe(
        tap(result => {
          if (result.loading) {
            // Update loading state
            this.stateFacade.setLoading(true);
          } else {
            // Set loading to false when we have a result
            this.stateFacade.setLoading(false);
          }
        }),
        map(result => {
          if (result.errors) {
            this.handleGraphQLErrors(operationName, result.errors as any[]);
          }
          // Handle null or undefined data
          if (!result.data) {
            throw new Error(`No data returned for operation: ${operationName}`);
          }
          return result.data;
        }),
        catchError(error => {
          this.handleGraphQLErrors(operationName, [error]);
          // Set loading to false on error
          this.stateFacade.setLoading(false);
          return throwError(() => error);
        }),
        finalize(() => {
          // Clear loading state when complete
          this.stateFacade.setLoading(false);
        })
      );
  }

  /**
   * Execute a GraphQL mutation and return the result
   * @param mutation The GraphQL mutation document
   * @param variables The variables for the mutation
   * @returns An Observable of the mutation result
   */
  mutate<T = any>(mutation: any, variables?: OperationVariables): Observable<T> {
    // Get the operation name for logging and tracking
    const operationName = this.getOperationName(mutation);
    
    // Set loading state
    this.stateFacade.setLoading(true);
    
    return this.apollo.mutate<T>({
      mutation,
      variables
    }).pipe(
      map(result => {
        if (result.errors) {
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        // Handle null or undefined data
        if (!result.data) {
          throw new Error(`No data returned for mutation: ${operationName}`);
        }
        // Set loading to false on success
        this.stateFacade.setLoading(false);
        return result.data;
      }),
      catchError(error => {
        this.handleGraphQLErrors(operationName, [error]);
        // Set loading to false on error
        this.stateFacade.setLoading(false);
        return throwError(() => error);
      }),
      finalize(() => {
        // Clear loading state when complete
        this.stateFacade.setLoading(false);
      })
    );
  }

  /**
   * Execute a GraphQL mutation with optimistic response
   * @param mutation The GraphQL mutation document
   * @param variables The variables for the mutation
   * @param optimisticResponse The optimistic response object
   * @param updateFunction The update function for the Apollo cache
   * @returns An Observable of the mutation result
   */
  optimisticMutate<T = any>(
    mutation: any, 
    variables?: any, 
    optimisticResponse?: any, 
    updateFunction?: any
  ): Observable<T> {
    // Get the operation name for logging and tracking
    const operationName = this.getOperationName(mutation);
    
    // Set loading state
    this.stateFacade.setLoading(true);
    
    return this.apollo.mutate<T>({
      mutation,
      variables,
      optimisticResponse,
      update: updateFunction
    }).pipe(
      map(result => {
        if (result.errors) {
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        // Handle null or undefined data
        if (!result.data) {
          throw new Error(`No data returned for optimistic mutation: ${operationName}`);
        }
        return result.data;
      }),
      catchError(error => {
        this.handleGraphQLErrors(operationName, [error]);
        return throwError(() => error);
      }),
      finalize(() => {
        // Clear loading state when complete
        this.stateFacade.setLoading(false);
      })
    );
  }

  /**
   * Subscribe to a GraphQL subscription
   * @param subscription The GraphQL subscription document
   * @param variables The variables for the subscription
   * @returns An Observable of the subscription result
   */
  subscribe<T = any>(subscription: any, variables?: OperationVariables): Observable<T> {
    const operationName = this.getOperationName(subscription);
    
    return this.apollo.subscribe<T>({
      query: subscription,
      variables
    }).pipe(
      map(result => {
        if (result.errors) {
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        // Handle null or undefined data
        if (!result.data) {
          throw new Error(`No data returned for subscription: ${operationName}`);
        }
        return result.data;
      }),
      catchError(error => {
        this.handleGraphQLErrors(operationName, [error]);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Extract operation name from a GraphQL document
   * @param document The GraphQL document
   * @returns The operation name or 'unknown operation'
   */
  private getOperationName(document: any): string {
    try {
      const definition = getMainDefinition(document);
      return definition.name?.value || 'unknown operation';
    } catch (error) {
      return 'unknown operation';
    }
  }
} 