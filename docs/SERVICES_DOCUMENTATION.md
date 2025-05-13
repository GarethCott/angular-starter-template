# Angular Services Documentation

## Overview

This document provides a comprehensive overview of all services implemented in our Angular starter template. Services are the core building blocks of our application's business logic, data access, and state management.

## Service Organization

Our services are organized into domain-specific folders to improve maintainability and separation of concerns:

```
services/
├── api/                # API communication services
│   ├── apollo-graphql.service.ts  # GraphQL client
│   ├── user.service.ts            # User data operations
│   └── index.ts                   # Barrel file for exports
├── auth/               # Authentication-related services
│   ├── amplify.service.ts         # AWS Amplify authentication
│   └── index.ts                   # Barrel file for exports
├── state/              # State management services
│   ├── state.service.ts           # Core state management
│   ├── state-facade.service.ts    # State facade for components
│   ├── state-persistence.service.ts # State persistence
│   ├── state-effects.service.ts   # State side effects
│   ├── state-debug.service.ts     # Debugging tools
│   ├── route-state.service.ts     # Router state integration
│   └── index.ts                   # Barrel file for exports
├── ui/                 # UI-related services
│   ├── theme.service.ts           # Theme management
│   └── index.ts                   # Barrel file for exports
├── utility/            # Utility services
│   ├── error-handler.service.ts   # Error handling
│   └── index.ts                   # Barrel file for exports
└── index.ts            # Main barrel file for all services
```

This organization provides several benefits:
- Clear separation of concerns with related services grouped together
- Improved code maintainability and discoverability
- Easier navigation through the codebase
- Simplified imports through barrel files
- Better team collaboration with clear module boundaries

### Using Barrel Files for Imports

All directories include barrel (index.ts) files that re-export the services, allowing for cleaner imports:

```typescript
// Instead of this:
import { AmplifyService } from './core/services/auth/amplify.service';
import { ApolloGraphqlService } from './core/services/api/apollo-graphql.service';

// You can do this:
import { AmplifyService } from './core/services/auth';
import { ApolloGraphqlService } from './core/services/api';

// Or even:
import { AmplifyService, ApolloGraphqlService } from './core/services';
```

## Core Services

### 1. AmplifyService

Handles AWS Amplify authentication operations and session management.

**Key Features:**
- Initializes Amplify authentication with configuration from environment
- Provides methods for sign up, sign in, sign out, and password recovery
- Implements automatic token refresh mechanism
- Integrates with state management for authentication status
- Handles user session management and persistence
- Extracts user roles from Cognito user groups

**Key Methods:**
```typescript
signUp(username: string, password: string, attributes: any): Observable<any>
confirmSignUp(username: string, code: string): Observable<any>
signIn(username: string, password: string): Observable<any>
signOut(): Observable<any>
resetPassword(username: string): Observable<any>
confirmResetPassword(username: string, code: string, newPassword: string): Observable<any>
checkAuthStatus(): Promise<void>
getAuthToken(): Promise<string | undefined>
```

### 2. ApolloGraphqlService

Manages GraphQL operations with Apollo Client.

**Key Features:**
- Configures Apollo Client with authentication and caching
- Sets up WebSocket connections for subscriptions
- Provides methods for queries, mutations, and subscriptions
- Implements optimistic updates for mutations
- Integrates with state management for loading and error handling
- Configures advanced caching strategies with type policies

**Key Methods:**
```typescript
query<T>(options: QueryOptions): Observable<T>
mutate<T>(mutation: DocumentNode, variables?: any, optimisticResponse?: any): Observable<T>
subscribe<T>(options: SubscriptionOptions): Observable<T>
resetStore(): Promise<void>
clearCache(): Promise<void>
```

### 3. UserService

Handles user data operations with caching.

**Key Features:**
- Provides CRUD operations for user data via GraphQL
- Implements local caching for performance optimization
- Integrates with state management for notifications
- Manages current user details retrieval
- Handles error states and notifications

**Key Methods:**
```typescript
getUser(id: string): Observable<User>
getUsers(): Observable<{ items: User[] }>
createUser(user: Partial<User>): Observable<User>
updateUser(user: Partial<User>): Observable<User>
deleteUser(id: string): Observable<User>
getCurrentUserDetails(): Observable<User>
```

### 4. ThemeService

Manages application theme with daisyUI integration.

**Key Features:**
- Theme switching with persistent storage
- Observable theme state
- Provides multiple theme options from daisyUI
- Handles system theme preference detection
- Integrates with state management for theme persistence

**Key Methods:**
```typescript
setTheme(theme: string): void
getCurrentTheme(): Observable<string>
toggleTheme(): void
detectSystemTheme(): string
get availableThemes(): string[]
```

### 5. ErrorHandlerService

Provides centralized error handling.

**Key Features:**
- Handles HTTP errors consistently
- Handles client-side errors
- Integrates with state management for error notifications
- Redirects to appropriate pages for auth errors
- Provides user-friendly error messages

**Key Methods:**
```typescript
handleError(error: any): void
logError(error: any): void
```

## State Management Services

### 1. StateService

Core service for state management using RxJS.

**Key Features:**
- Maintains application state in a BehaviorSubject
- Provides immutable state updates with deep merging
- Includes selectors for efficient component subscriptions
- Manages user authentication state, theme preferences, notifications, and loading state
- Provides type safety through TypeScript interfaces

**Key Methods:**
```typescript
getCurrentState(): AppState
getState(): Observable<AppState>
select<T>(selector: (state: AppState) => T): Observable<T>
updateState(partialState: Partial<AppState>): void
resetState(): void
setAuthState(isAuthenticated: boolean, userData?: any): void
setLoading(isLoading: boolean): void
addNotification(message: string, type: string, metadata?: any): Notification
```

### 2. StateFacadeService

Provides a simplified API for components to interact with state.

**Key Features:**
- Abstracts state management implementation details
- Provides focused methods for common state operations
- Follows the Facade pattern to reduce coupling
- Serves as the single point of interaction for components
- Simplifies testing by allowing easy mocking

**Key Methods:**
```typescript
isAuthenticated(): Observable<boolean>
getUserRoles(): Observable<string[] | undefined>
setAuthenticated(isAuthenticated: boolean, userData?: any): void
getTheme(): Observable<string>
setTheme(theme: string): void
notify(message: string, type: string, metadata?: any): void
getNotifications(): Observable<Notification[]>
dismissNotification(id: string): void
clearNotifications(): void
setLoading(isLoading: boolean): void
isLoading(): Observable<boolean>
```

### 3. StatePersistenceService

Manages saving and restoring state from localStorage.

**Key Features:**
- Automatically persists state changes to localStorage
- Hydrates state from localStorage on application startup
- Selectively persists only non-sensitive data
- Handles browser vs server-side rendering environments
- Provides methods for manual state persistence

**Key Methods:**
```typescript
saveState(): void
clearPersistedState(): void
```

### 4. StateEffectsService

Handles side effects triggered by state changes.

**Key Features:**
- Reacts to state changes with side effects
- Manages navigation based on authentication state
- Handles cleanup of sensitive data on logout
- Tracks page views for analytics
- Properly cleans up subscriptions

**Key Methods:**
```typescript
private initializeEffects(): void
```

### 5. StateDebugService

Provides debugging tools for state management in development mode.

**Key Features:**
- Logs state changes with diff tracking
- Maintains a history of recent state changes
- Exposes global debug methods in development mode
- Only active in development mode

**Key Methods:**
```typescript
private setupDebugTools(): void
private getStateChanges(prevState: AppState, newState: AppState): Record<string, any>
```

### 6. RouteStateService

Integrates state management with Angular Router.

**Key Features:**
- Synchronizes route state with application state
- Tracks navigation history in state
- Implements deep-linking with query parameters
- Provides consistent routing experience

**Key Methods:**
```typescript
navigateTo(path: string, extras?: NavigationExtras): void
getCurrentRoute(): Observable<RouterState | undefined>
```

## Shared Services

### 1. ToastService

Manages toast notifications with integration to state management.

**Key Features:**
- Displays user notifications as toasts
- Integrates with state management notification system
- Supports different notification types (info, success, warning, error)
- Configurable toast duration and position
- Provides simple API for showing notifications

**Key Methods:**
```typescript
show(message: string, type: ToastType, options?: any): string
info(message: string, options?: any): string
success(message: string, options?: any): string
warning(message: string, options?: any): string
error(message: string, options?: any): string
dismiss(id: string): void
clear(): void
getToasts(): Observable<Toast[]>
```

## Best Practices Used in Services

### 1. Dependency Injection
Services follow Angular's dependency injection pattern, making them easy to test and maintain:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(
    private stateFacade: StateFacadeService
  ) { ... }
}
```

### 2. Reactive Programming
Services use RxJS for reactive programming patterns:

```typescript
getCurrentUserDetails(): Observable<User> {
  return this.stateFacade.isAuthenticated().pipe(
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        throw new Error('User is not authenticated');
      }
      
      return this.stateFacade.getUsername().pipe(
        switchMap(username => {
          // implementation...
        })
      );
    })
  );
}
```

### 3. Error Handling
Services implement consistent error handling:

```typescript
query<T>(options: QueryOptions): Observable<T> {
  this.stateFacade.setLoading(true);
  
  return this.apollo.query<T>(options).pipe(
    map(result => result.data),
    catchError(error => {
      this.stateFacade.notify(`Query error: ${error.message}`, 'error');
      return throwError(() => error);
    }),
    finalize(() => {
      this.stateFacade.setLoading(false);
    })
  );
}
```

### 4. Caching Strategies
Services implement caching for performance:

```typescript
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
    })
  );
}
```

### 5. State Management Integration
Services are integrated with state management:

```typescript
signIn(username: string, password: string): Observable<any> {
  return from(signIn({ username, password })).pipe(
    tap(result => {
      if (result && result.isSignedIn) {
        // Update auth state in global state management
        this.stateFacade.setAuthenticated(true, {
          userId: user.userId,
          username: user.username,
          roles: roles
        });
        
        // Show success notification
        this.stateFacade.notify('Successfully signed in', 'success');
      }
    })
  );
}
```

## Service Interactions

Services in the application interact with each other to provide a cohesive system:

1. **Authentication and API Services**: 
   `AmplifyService` provides authentication tokens to `ApolloGraphqlService` for secure API calls.

2. **State Management Integration**:
   All services interact with state management via the `StateFacadeService`.

3. **Theme and Persistence**:
   `ThemeService` uses `StatePersistenceService` to remember user theme preferences.

4. **Error Handling**:
   Services use `ErrorHandlerService` and state management for consistent error reporting.

5. **Data and Authentication**:
   `UserService` depends on `AmplifyService` for authentication status and `ApolloGraphqlService` for data operations.

## Service Initialization

Services are initialized in the AppModule or AppComponent:

```typescript
@Component({
  selector: 'app-root',
  // ...
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private statePersistenceService: StatePersistenceService,
    private stateEffectsService: StateEffectsService,
    private routeStateService: RouteStateService,
    private stateDebugService: StateDebugService
  ) {}
  
  ngOnInit(): void {
    // Initialize theme service (will use state service internally)
    this.themeService.currentTheme$.subscribe();
  }
}
```

## Conclusion

Our services architecture follows Angular best practices with a focus on:

1. **Separation of Concerns**: Each service has a well-defined responsibility
2. **Reactive Programming**: RxJS is used consistently for asynchronous operations
3. **State Management Integration**: Services interact with a centralized state
4. **Error Handling**: Consistent error handling and reporting
5. **Performance Optimization**: Caching and efficient data access
6. **Testing**: Services are designed to be easily testable
7. **Maintainability**: Clear patterns and organization
8. **Domain-driven Organization**: Services are organized into logical domains 