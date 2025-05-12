export const environment = {
  production: false,
  appVersion: '1.0.0',
  apiLogging: true,
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
    authenticationType: 'AMAZON_COGNITO_USER_POOLS', // or API_KEY, AWS_IAM, etc.
    // For real-time subscriptions
    webSocketEndpoint: 'wss://YOUR_APPSYNC_ENDPOINT/graphql',
    // For API key auth
    apiKey: 'YOUR_APPSYNC_API_KEY' // Only needed if authenticationType is API_KEY
  },
  // REST API endpoints (if used alongside GraphQL)
  api: {
    baseUrl: 'https://api.example.com',
    endpoints: {
      users: '/users',
      items: '/items'
    }
  },
  // Feature flags
  features: {
    enableSubscriptions: true,
    enableOfflineMode: true,
    enableErrorReporting: true,
    enableAnalytics: true
  }
}; 