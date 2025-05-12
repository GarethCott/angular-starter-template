# Apollo Client and AWS Amplify Integration Guide

## Overview

This guide provides detailed information about how Apollo Client and AWS Amplify are integrated in our Angular starter template. The integration follows best practices for authentication and GraphQL operations.

## Architecture

The integration follows a clear separation of concerns:

1. **AWS Amplify**: Handles authentication, user management, and token management
2. **Apollo Client**: Manages GraphQL operations, caching, and real-time subscriptions

## Authentication Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  User Login   │────▶│ Amplify Auth  │────▶│ ID/Access     │
│  Component    │     │ Service       │     │ Tokens        │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────┬───────┘
                                                    │
                                                    ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  GraphQL      │◀────│ Apollo Client │◀────│ Auth Link     │
│  Endpoint     │     │ Service       │     │ (Add Tokens)  │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

## Key Components

### 1. AmplifyService

The `AmplifyService` encapsulates all AWS Amplify authentication operations:

```typescript
// Key methods in AmplifyService
signIn(username: string, password: string): Observable<any>
signUp(username: string, password: string, email: string): Observable<any>
confirmSignUp(username: string, code: string): Observable<any>
signOut(): Observable<any>
getCurrentUser(): Observable<any>
getAuthSession(): Promise<any>
isAuthenticated(): Observable<boolean>
```

#### Token Refresh Implementation

Automatic token refresh is implemented to maintain authentication sessions:

```typescript
private setupTokenRefresh(): void {
  const refreshInterval = setInterval(async () => {
    try {
      const session = await this.getAuthSession();
      if (session && session.tokens) {
        const expirationTime = session.tokens.idToken.payload.exp * 1000;
        const currentTime = Date.now();
        const timeToExpire = expirationTime - currentTime;
        
        if (timeToExpire < 600000) { // 10 minutes
          await fetchAuthSession();
          console.log('Auth session refreshed');
        }
      }
    } catch (error) {
      console.error('Error in token refresh:', error);
    }
  }, 300000); // Check every 5 minutes
}
```

### 2. ApolloGraphqlService

The `ApolloGraphqlService` manages GraphQL operations using Apollo Client:

```typescript
// Key methods in ApolloGraphqlService
query<T = any>(options: WatchQueryOptions<OperationVariables, T>): Observable<T>
mutate<T = any>(mutation: any, variables?: OperationVariables): Observable<T>
optimisticMutate<T = any>(mutation: any, variables?: any, optimisticResponse?: any, updateFunction?: any): Observable<T>
subscribe<T = any>(subscription: any, variables?: OperationVariables): Observable<T>
```

#### Authentication Integration

The Apollo Client is configured with an authentication link that automatically adds tokens to requests:

```typescript
private async setupApolloClient(): Promise<void> {
  // Create the auth link
  const authLink = setContext(async (_, { headers }) => {
    try {
      const session = await this.amplifyService.getAuthSession();
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

  // Use the auth link in Apollo Client setup
  // ...
}
```

### 3. WebSocket Support for Subscriptions

Real-time GraphQL subscriptions are enabled using WebSocket:

```typescript
// Configure WebSocket support for subscriptions
if (environment.features.enableSubscriptions && environment.graphql.webSocketEndpoint) {
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
```

### 4. Caching Strategy

Apollo Client is configured with an advanced caching strategy:

```typescript
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
})
```

## Error Handling

Both the Amplify and Apollo services include comprehensive error handling:

### 1. GraphQL Error Handling

```typescript
handleGraphQLErrors(operation: string, errors: any[]): void {
  errors.forEach(error => {
    console.error(`[GraphQL error]: Operation: ${operation}, Message: ${error.message}`);
    
    // Handle specific error types
    if (error.extensions && error.extensions['code'] === 'UNAUTHENTICATED') {
      // Refresh tokens or redirect to login
      this.amplifyService.signOut().subscribe(() => {
        window.location.href = '/login';
      });
    }
    
    // Handle network errors
    if (error.networkError) {
      console.error('Network error', error.networkError);
    }
  });
}
```

### 2. HTTP Error Handling

```typescript
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
  } else {
    // Other HTTP errors
    console.error(`HTTP Error ${error.status}:`, error.message);
  }
}
```

## Environment Configuration

The integration is configured through the environment files:

```typescript
// Environment configuration
export const environment = {
  production: false,
  // AWS Amplify authentication configuration
  amplify: {
    region: 'us-east-1',
    userPoolId: 'YOUR_COGNITO_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_COGNITO_APP_CLIENT_ID',
    identityPoolId: 'YOUR_COGNITO_IDENTITY_POOL_ID'
  },
  // GraphQL configuration for Apollo Client
  graphql: {
    endpoint: 'YOUR_APPSYNC_ENDPOINT',
    region: 'us-east-1',
    authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    // For real-time subscriptions
    webSocketEndpoint: 'wss://YOUR_APPSYNC_ENDPOINT/graphql',
    // For API key auth
    apiKey: 'YOUR_APPSYNC_API_KEY' // Only if using API_KEY auth
  },
  // Feature flags
  features: {
    enableSubscriptions: true,
    enableOfflineMode: true,
    enableErrorReporting: true,
    enableAnalytics: true
  }
};
```

## Best Practices

1. **Separation of Concerns**: Authentication logic is kept separate from GraphQL operations
2. **Token Management**: Tokens are automatically refreshed and securely managed
3. **Error Handling**: Comprehensive error handling and reporting
4. **Caching Strategy**: Optimized caching for better performance
5. **Feature Flags**: Configuration through feature flags for flexibility

## Common Issues and Solutions

### 1. Token Expiration

**Problem**: Authentication tokens expire, causing 401 errors.

**Solution**: Automatic token refresh is implemented in the `AmplifyService`.

### 2. Offline Operations

**Problem**: App fails when offline.

**Solution**: Apollo Cache can be configured for offline operation (enabled via feature flag).

### 3. Real-time Updates

**Problem**: UI doesn't update in real-time when data changes.

**Solution**: WebSocket subscriptions are implemented for real-time updates.

## References

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/) 