import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { environment } from '../../../environments/environment';
import { WatchQueryOptions, OperationVariables } from '@apollo/client/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AmplifyService } from './amplify.service';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

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
    private amplifyService: AmplifyService
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
    // Log errors to monitoring service
    errors.forEach(error => {
      console.error(`[GraphQL error]: Operation: ${operation}, Message: ${error.message}`);
      
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
      }
    });
  }

  /**
   * Execute a GraphQL query and return the result
   * @param options The GraphQL query options
   * @returns An Observable of the query result
   */
  query<T = any>(options: WatchQueryOptions<OperationVariables, T>): Observable<T> {
    return this.apollo.watchQuery<T>(options)
      .valueChanges
      .pipe(
        map(result => {
          if (result.errors) {
            // Get operation name for error reporting
            const operationName = 'unknown query';
            this.handleGraphQLErrors(operationName, result.errors as any[]);
          }
          return result.data;
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
    return this.apollo.mutate<T>({
      mutation,
      variables
    }).pipe(
      map(result => {
        if (result.errors) {
          // Get operation name for error reporting
          const operationName = 'unknown mutation';
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        return result.data as T;
      })
    );
  }

  /**
   * Execute a GraphQL mutation with optimistic response
   * @param mutation The GraphQL mutation document
   * @param variables The variables for the mutation
   * @param optimisticResponse The optimistic response to use before server response
   * @param updateFunction Cache update function
   * @returns An Observable of the mutation result
   */
  optimisticMutate<T = any>(
    mutation: any, 
    variables?: any, 
    optimisticResponse?: any, 
    updateFunction?: any
  ): Observable<T> {
    return this.apollo.mutate<T>({
      mutation,
      variables,
      optimisticResponse,
      update: updateFunction
    }).pipe(
      map(result => {
        if (result.errors) {
          // Get operation name for error reporting
          const operationName = 'unknown mutation';
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        return result.data as T;
      })
    );
  }

  /**
   * Subscribe to real-time updates
   * @param subscription The GraphQL subscription document
   * @param variables The variables for the subscription
   * @returns An Observable of the subscription updates
   */
  subscribe<T = any>(subscription: any, variables?: OperationVariables): Observable<T> {
    return this.apollo.subscribe<T>({
      query: subscription,
      variables
    }).pipe(
      map(result => {
        if (result.errors) {
          const operationName = 'unknown subscription';
          this.handleGraphQLErrors(operationName, result.errors as any[]);
        }
        return result.data as T;
      })
    );
  }
} 