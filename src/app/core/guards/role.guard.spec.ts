import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { RoleGuard } from './role.guard';
import { AmplifyService } from '../services/auth/amplify.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let amplifyServiceMock: jasmine.SpyObj<AmplifyService>;
  let routerMock: jasmine.SpyObj<Router>;
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    // Create mock URL tree for testing redirects
    mockUrlTree = new UrlTree();
    
    // Create router spy
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerMock.createUrlTree.and.returnValue(mockUrlTree);
    
    // Create AmplifyService spy
    amplifyServiceMock = jasmine.createSpyObj('AmplifyService', ['getCurrentUser']);
    
    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AmplifyService, useValue: amplifyServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
    
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow access for users with admin role', (done) => {
      // Mock user with admin role
      const mockUserWithAdminRole = {
        signInUserSession: {
          accessToken: {
            payload: {
              'cognito:groups': ['admin', 'user']
            }
          }
        }
      };
      
      // Setup AmplifyService to return user with admin role
      amplifyServiceMock.getCurrentUser.and.returnValue(of(mockUserWithAdminRole));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
        done();
      });
    });

    it('should deny access for users without admin role', (done) => {
      // Mock user without admin role
      const mockUserWithoutAdminRole = {
        signInUserSession: {
          accessToken: {
            payload: {
              'cognito:groups': ['user']
            }
          }
        }
      };
      
      // Setup AmplifyService to return user without admin role
      amplifyServiceMock.getCurrentUser.and.returnValue(of(mockUserWithoutAdminRole));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
        done();
      });
    });

    it('should deny access when user has no roles', (done) => {
      // Mock user with no roles
      const mockUserWithNoRoles = {
        signInUserSession: {
          accessToken: {
            payload: {
              'cognito:groups': []
            }
          }
        }
      };
      
      // Setup AmplifyService to return user with no roles
      amplifyServiceMock.getCurrentUser.and.returnValue(of(mockUserWithNoRoles));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
        done();
      });
    });

    it('should deny access when user has undefined roles', (done) => {
      // Mock user with undefined roles
      const mockUserWithUndefinedRoles = {
        signInUserSession: {
          accessToken: {
            payload: {}
          }
        }
      };
      
      // Setup AmplifyService to return user with undefined roles
      amplifyServiceMock.getCurrentUser.and.returnValue(of(mockUserWithUndefinedRoles));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
        done();
      });
    });

    it('should deny access when user session is incomplete', (done) => {
      // Mock incomplete user object
      const mockIncompleteUser = {};
      
      // Setup AmplifyService to return incomplete user
      amplifyServiceMock.getCurrentUser.and.returnValue(of(mockIncompleteUser));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
        done();
      });
    });

    it('should deny access when user is null', (done) => {
      // Setup AmplifyService to return null user
      amplifyServiceMock.getCurrentUser.and.returnValue(of(null));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
        done();
      });
    });
  });
}); 