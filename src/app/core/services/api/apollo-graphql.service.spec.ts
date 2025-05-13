import { TestBed, inject } from '@angular/core/testing';
import { Apollo, ApolloBase } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { of, throwError } from 'rxjs';
import { ApolloGraphqlService } from './apollo-graphql.service';
import { AmplifyService } from '../auth/amplify.service';
import { StateFacadeService } from '../state/state-facade.service';
import { DocumentNode } from '@apollo/client/core';
import { Injectable } from '@angular/core';

@Injectable()
class TestableApolloGraphqlService extends ApolloGraphqlService {
  // Override the constructor to avoid calling setupApolloClient
  constructor(
    apollo: Apollo,
    httpLink: HttpLink, 
    amplifyService: AmplifyService,
    stateFacade: StateFacadeService
  ) {
    super(apollo, httpLink, amplifyService, stateFacade);
    // Skip calling setupApolloClient by setting a flag
    (this as any).setupComplete = true;
  }
  
  // Expose the private apollo property for testing
  setTestApollo(apollo: ApolloBase) {
    (this as any).apollo = apollo;
  }
  
  // Expose handleGraphQLErrors for testing
  public testHandleGraphQLErrors(operation: string, errors: any[]): void {
    (this as any).handleGraphQLErrors(operation, errors);
  }
}

describe('ApolloGraphqlService', () => {
  let service: TestableApolloGraphqlService;
  let apolloMock: jasmine.SpyObj<Apollo>;
  let apolloBaseMock: jasmine.SpyObj<ApolloBase>;
  let httpLinkMock: jasmine.SpyObj<HttpLink>;
  let amplifyServiceMock: jasmine.SpyObj<AmplifyService>;
  let stateFacadeMock: jasmine.SpyObj<StateFacadeService>;

  // Simulate GraphQL document
  const mockQuery: DocumentNode = {
    kind: 'Document',
    definitions: [{
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUsers' },
      selectionSet: { kind: 'SelectionSet', selections: [] }
    }]
  } as any;

  const mockMutation: DocumentNode = {
    kind: 'Document',
    definitions: [{
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateUser' },
      selectionSet: { kind: 'SelectionSet', selections: [] }
    }]
  } as any;

  const mockSubscription: DocumentNode = {
    kind: 'Document',
    definitions: [{
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'onUserUpdate' },
      selectionSet: { kind: 'SelectionSet', selections: [] }
    }]
  } as any;

  beforeEach(() => {
    // Mock environment configuration
    (window as any).environment = {
      features: {
        enableSubscriptions: true
      },
      graphql: {
        endpoint: 'https://example.com/graphql',
        webSocketEndpoint: 'wss://example.com/graphql'
      },
      amplify: {
        userPoolId: 'test-user-pool',
        identityPoolId: 'test-identity-pool',
        userPoolWebClientId: 'test-client-id'
      }
    };

    // Create mocks for all dependencies
    apolloBaseMock = jasmine.createSpyObj('ApolloBase', ['watchQuery', 'mutate', 'subscribe']);
    apolloMock = jasmine.createSpyObj('Apollo', ['use', 'createNamed']);
    httpLinkMock = jasmine.createSpyObj('HttpLink', ['create']);
    amplifyServiceMock = jasmine.createSpyObj('AmplifyService', ['getAuthSession', 'signOut']);
    stateFacadeMock = jasmine.createSpyObj('StateFacadeService', ['setLoading', 'notify']);

    // Setup mock returns
    apolloMock.use.and.returnValue(apolloBaseMock);
    
    // Create a fake httpLink
    httpLinkMock.create.and.returnValue({
      request: jasmine.createSpy('request')
    } as any);
    
    amplifyServiceMock.getAuthSession.and.resolveTo({ 
      tokens: { 
        idToken: { 
          toString: () => 'fake-token' 
        } 
      } 
    });
    amplifyServiceMock.signOut.and.returnValue(of({}));

    // Mock watchQuery method
    apolloBaseMock.watchQuery.and.returnValue({
      valueChanges: of({
        loading: false,
        data: { users: [{ id: '1', name: 'John' }] }
      })
    } as any);

    // Mock mutate method
    apolloBaseMock.mutate.and.returnValue(of({
      data: { updateUser: { id: '1', name: 'Updated John' } }
    }));

    // Mock subscribe method
    apolloBaseMock.subscribe.and.returnValue(of({
      data: { onUserUpdate: { id: '1', name: 'John Updated' } }
    }));

    TestBed.configureTestingModule({
      providers: [
        { provide: Apollo, useValue: apolloMock },
        { provide: HttpLink, useValue: httpLinkMock },
        { provide: AmplifyService, useValue: amplifyServiceMock },
        { provide: StateFacadeService, useValue: stateFacadeMock },
        { provide: ApolloGraphqlService, useClass: TestableApolloGraphqlService }
      ]
    });

    // Get service instance and set up for testing
    service = TestBed.inject(ApolloGraphqlService) as TestableApolloGraphqlService;
    service.setTestApollo(apolloBaseMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('query', () => {
    it('should execute a GraphQL query successfully', (done) => {
      // Setup test
      const expectedData = { users: [{ id: '1', name: 'John' }] };

      // Execute query
      service.query({
        query: mockQuery
      }).subscribe({
        next: (data) => {
          // Verify Apollo watchQuery was called
          expect(apolloBaseMock.watchQuery).toHaveBeenCalled();
          
          // Verify loading state was handled
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(true);
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(false);
          
          // Verify data was returned correctly
          expect(data).toEqual(expectedData);
          
          done();
        },
        error: (err) => {
          done.fail('Query should not have failed');
        }
      });
    });

    it('should handle GraphQL query errors', (done) => {
      // Setup test with an error response
      apolloBaseMock.watchQuery.and.returnValue({
        valueChanges: throwError(() => new Error('Query failed'))
      } as any);
      
      // Spy on the actual method we're testing
      spyOn<any>(service, 'handleGraphQLErrors');

      // Execute query
      service.query({
        query: mockQuery
      }).subscribe({
        next: () => {
          done.fail('Should not have succeeded');
        },
        error: (err) => {
          // Should have called error handler
          expect(service['handleGraphQLErrors']).toHaveBeenCalled();
          // Loading should be set to false
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(false);
          done();
        }
      });
    });

    it('should handle network errors', (done) => {
      // Setup test with a network error
      const networkError = new Error('Network error');
      apolloBaseMock.watchQuery.and.returnValue({
        valueChanges: throwError(() => networkError)
      } as any);
      
      // Spy on the actual method we're testing
      spyOn<any>(service, 'handleGraphQLErrors');

      // Execute query
      service.query({
        query: mockQuery
      }).subscribe({
        next: () => {
          done.fail('Should have failed with error');
        },
        error: (err) => {
          // Should have called error handler
          expect(service['handleGraphQLErrors']).toHaveBeenCalled();
          
          // Should have set loading to false
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(false);
          
          done();
        }
      });
    });
  });

  describe('mutate', () => {
    it('should execute a GraphQL mutation successfully', (done) => {
      // Setup test
      const expectedData = { updateUser: { id: '1', name: 'Updated John' } };
      const variables = { id: '1', name: 'Updated John' };

      // Execute mutation
      service.mutate(mockMutation, variables).subscribe({
        next: (data) => {
          // Verify Apollo mutate was called with correct parameters
          expect(apolloBaseMock.mutate).toHaveBeenCalledWith({
            mutation: mockMutation,
            variables
          });
          
          // Verify loading state was handled
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(true);
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(false);
          
          // Verify data was returned correctly
          expect(data).toEqual(expectedData);
          
          done();
        },
        error: (err) => {
          done.fail('Mutation should not have failed');
        }
      });
    });

    it('should handle GraphQL mutation errors', (done) => {
      // Setup test with an error response
      apolloBaseMock.mutate.and.returnValue(throwError(() => new Error('Test error message')));
      
      // Spy on the actual method we're testing
      spyOn<any>(service, 'handleGraphQLErrors');

      // Execute mutation
      const variables = { id: '1', name: 'Test User' };
      service.mutate(mockMutation, variables).subscribe({
        next: () => {
          done.fail('Should have failed with error');
        },
        error: (err) => {
          // Verify GraphQL error handler was called
          expect(service['handleGraphQLErrors']).toHaveBeenCalled();
          
          // Should have set loading to false
          expect(stateFacadeMock.setLoading).toHaveBeenCalledWith(false);
          
          done();
        }
      });
    });
  });

  describe('subscribe', () => {
    it('should execute a GraphQL subscription successfully', (done) => {
      // Setup test
      const expectedData = { onUserUpdate: { id: '1', name: 'John Updated' } };
      const variables = { userId: '1' };

      // Execute subscription
      service.subscribe(mockSubscription, variables).subscribe({
        next: (data) => {
          // Verify Apollo subscribe was called with correct parameters
          expect(apolloBaseMock.subscribe).toHaveBeenCalledWith({
            query: mockSubscription,
            variables
          });
          
          // Verify data was returned correctly
          expect(data).toEqual(expectedData);
          
          done();
        },
        error: (err) => {
          done.fail('Subscription should not have failed');
        }
      });
    });

    it('should handle GraphQL subscription errors', (done) => {
      // Setup test with an error response
      const subscriptionError = new Error('Subscription error');
      apolloBaseMock.subscribe.and.returnValue(throwError(() => subscriptionError));
      
      // Create spy for handleGraphQLErrors method
      spyOn<any>(service, 'handleGraphQLErrors');

      // Execute subscription
      service.subscribe(mockSubscription, {}).subscribe({
        next: () => {
          done.fail('Should have failed with error');
        },
        error: (err) => {
          // Should have called error handler
          expect((service as any).handleGraphQLErrors).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('handleGraphQLErrors', () => {
    it('should notify user about GraphQL errors', () => {
      const errors = [{ message: 'Test error message' }];
      
      // Call the private method directly using type assertion
      (service as any).handleGraphQLErrors('testOperation', errors);
      
      // Verify notification was shown
      expect(stateFacadeMock.notify).toHaveBeenCalledWith(
        'GraphQL Error: Test error message',
        'error'
      );
    });

    it('should handle authentication errors', () => {
      const errors = [{
        message: 'Not authenticated',
        extensions: { code: 'UNAUTHENTICATED' }
      }];
      
      // Mock sign out
      amplifyServiceMock.signOut = jasmine.createSpy().and.returnValue(of({}));
      
      // Call the private method directly using type assertion
      (service as any).handleGraphQLErrors('testOperation', errors);
      
      // Verify notification was shown
      expect(stateFacadeMock.notify).toHaveBeenCalledWith(
        'GraphQL Error: Not authenticated',
        'error'
      );
      
      // Verify sign out was called for authentication errors
      expect(amplifyServiceMock.signOut).toHaveBeenCalled();
    });

    it('should handle network errors', () => {
      const errors = [{
        message: 'Failed to fetch',
        networkError: { message: 'Network error' }
      }];
      
      // Call the private method directly using type assertion
      (service as any).handleGraphQLErrors('testOperation', errors);
      
      // Verify network error notification was shown
      expect(stateFacadeMock.notify).toHaveBeenCalledWith(
        'Network error while connecting to the GraphQL server',
        'error'
      );
    });
  });
}); 