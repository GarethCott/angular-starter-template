import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AmplifyService } from '../services/auth/amplify.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
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
    amplifyServiceMock = jasmine.createSpyObj('AmplifyService', ['isAuthenticated']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AmplifyService, useValue: amplifyServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
    
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow access when authenticated', (done) => {
      // Set up amplify service to return authenticated = true
      amplifyServiceMock.isAuthenticated.and.returnValue(of(true));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to login when not authenticated', (done) => {
      // Set up amplify service to return authenticated = false
      amplifyServiceMock.isAuthenticated.and.returnValue(of(false));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });

  describe('canActivateChild', () => {
    it('should allow child access when authenticated', (done) => {
      // Set up amplify service to return authenticated = true
      amplifyServiceMock.isAuthenticated.and.returnValue(of(true));

      guard.canActivateChild().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to login when not authenticated', (done) => {
      // Set up amplify service to return authenticated = false
      amplifyServiceMock.isAuthenticated.and.returnValue(of(false));

      guard.canActivateChild().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });

  describe('canLoad', () => {
    it('should allow loading when authenticated', (done) => {
      // Set up amplify service to return authenticated = true
      amplifyServiceMock.isAuthenticated.and.returnValue(of(true));

      guard.canLoad().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to login when not authenticated', (done) => {
      // Set up amplify service to return authenticated = false
      amplifyServiceMock.isAuthenticated.and.returnValue(of(false));

      guard.canLoad().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });
}); 