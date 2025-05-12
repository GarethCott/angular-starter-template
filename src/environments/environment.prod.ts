export const environment = {
  production: true,
  appVersion: '1.0.0',
  apiLogging: false,
  // AWS Amplify authentication configuration
  amplify: {
    region: 'us-east-1',
    userPoolId: 'YOUR_PROD_COGNITO_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_PROD_COGNITO_APP_CLIENT_ID',
    identityPoolId: 'YOUR_PROD_COGNITO_IDENTITY_POOL_ID'
  },
  // GraphQL configuration for Apollo Client
  graphql: {
    endpoint: 'YOUR_PROD_APPSYNC_ENDPOINT',
    region: 'us-east-1',
    authenticationType: 'AMAZON_COGNITO_USER_POOLS', // or API_KEY, AWS_IAM, etc.
    // For real-time subscriptions
    webSocketEndpoint: 'wss://YOUR_PROD_APPSYNC_ENDPOINT/graphql',
    // For API key auth
    apiKey: 'YOUR_PROD_APPSYNC_API_KEY' // Only needed if authenticationType is API_KEY
  },
  // REST API endpoints (if used alongside GraphQL)
  api: {
    baseUrl: 'https://api.prod.example.com',
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