# angular-starter-template

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.8.

## Features

This starter template includes several advanced features:

- **Angular Standalone Components Architecture** for better modularity and performance
- **Apollo Client Integration** for GraphQL operations
- **AWS Amplify Integration** for authentication and user management
- **Tailwind CSS** for utility-first styling 
- **Comprehensive Error Handling** for both GraphQL and HTTP operations
- **Real-time Updates** with WebSocket subscriptions
- **Advanced Caching Strategy** for better performance
- **Role-based Authentication** with route guards
- **Lazy Loading** for improved initial load times

## Architecture Overview

The template follows a clear separation of concerns:

1. **AWS Amplify**: Handles authentication, user management, and token management
2. **Apollo Client**: Manages GraphQL operations, caching, and real-time subscriptions

### Key Components

- **AmplifyService**: Encapsulates all AWS Amplify authentication operations with automatic token refresh
- **ApolloGraphqlService**: Manages GraphQL operations with Apollo Client
- **AuthInterceptor**: Automatically adds authentication tokens to HTTP requests
- **Role-based Guards**: Protects routes based on user roles

### Project Structure

```
src/
├── app/
│   ├── core/                  # Core functionality (services, guards, interceptors)
│   │   ├── guards/            # Route guards (AuthGuard, RoleGuard)
│   │   ├── interceptors/      # HTTP interceptors (AuthInterceptor)
│   │   ├── services/          # Services (AmplifyService, ApolloGraphqlService, ErrorHandlerService)
│   │   └── core.module.ts     # Core module definition
│   ├── features/              # Feature components
│   │   ├── admin/             # Admin feature
│   │   ├── auth/              # Authentication feature
│   │   │   └── components/    # Login, Register, Unauthorized components (standalone)
│   │   ├── dashboard/         # Dashboard feature
│   │   └── profile/           # Profile feature (standalone component)
│   ├── shared/                # Shared components, directives, pipes
│   ├── app.component.ts       # App root component
│   ├── app.routes.ts          # Application routes
│   └── app.module.ts          # App module definition
├── environments/
│   ├── environment.ts         # Development environment configuration
│   └── environment.prod.ts    # Production environment configuration
```

## Configuration

The template is configured through environment files. You'll need to update the following in your environment files:

```typescript
export const environment = {
  production: false,
  // AWS Amplify authentication configuration
  amplify: {
    region: 'YOUR_AWS_REGION',
    userPoolId: 'YOUR_COGNITO_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_COGNITO_APP_CLIENT_ID',
    identityPoolId: 'YOUR_COGNITO_IDENTITY_POOL_ID'
  },
  // GraphQL configuration for Apollo Client
  graphql: {
    endpoint: 'YOUR_GRAPHQL_ENDPOINT',
    region: 'YOUR_AWS_REGION',
    authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    webSocketEndpoint: 'YOUR_WEBSOCKET_ENDPOINT',
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

## Getting Started

```bash
# Clone the repository
git clone https://github.com/GarethCott/angular-starter-template.git

# Navigate to the project directory
cd angular-starter-template

# Install dependencies
npm install

# Start the development server
ng serve
```

## Documentation

For more detailed information, check the documentation in the `docs` folder:

- [Apollo Client and AWS Amplify Integration Guide](docs/APOLLO_AMPLIFY_INTEGRATION.md)
- [Angular Starter Template Improvements Documentation](docs/ANGULAR_STARTER_TEMPLATE_IMPROVEMENTS.md)

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
