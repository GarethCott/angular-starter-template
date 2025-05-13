import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { StateFacadeService } from './state-facade.service';
import { StateService } from './state.service';
import { of } from 'rxjs';
import { Notification, PreferencesState, AppState, UIState, UserState } from '../../models/state.model';
import { RouterState } from '../route-state.service';

describe('StateFacadeService', () => {
  let service: StateFacadeService;
  let stateServiceMock: jasmine.SpyObj<StateService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

  // Mock state that matches AppState interface
  const mockAppState: AppState = {
    user: {
      isAuthenticated: false
    } as UserState,
    ui: {
      theme: 'light',
      notifications: [],
      isLoading: false,
      lastViewedPage: '',
      sidebarCollapsed: false
    } as UIState,
    preferences: {
      theme: 'light'
    } as PreferencesState,
    router: {
      url: '/',
      params: {},
      queryParams: {},
      data: {},
      title: 'Home'
    } as RouterState
  };

  beforeEach(() => {
    // Create mock for StateService
    stateServiceMock = jasmine.createSpyObj('StateService', [
      'select',
      'setAuthState',
      'getTheme',
      'setTheme',
      'addNotification',
      'markNotificationAsRead',
      'clearNotifications',
      'getNotifications',
      'setLoading',
      'getLoading',
      'toggleSidebar',
      'getSidebarCollapsed',
      'setLastViewedPage',
      'getLastViewedPage',
      'updatePreferences',
      'getPreferences',
      'getCurrentState',
      'updateState',
      'resetState'
    ]);

    // Setup default returns for commonly used methods
    stateServiceMock.select.and.returnValue(of(null));
    stateServiceMock.getTheme.and.returnValue(of('light'));
    stateServiceMock.getNotifications.and.returnValue(of([]));
    stateServiceMock.getLoading.and.returnValue(of(false));
    stateServiceMock.getSidebarCollapsed.and.returnValue(of(false));
    stateServiceMock.getLastViewedPage.and.returnValue(of(''));
    stateServiceMock.getPreferences.and.returnValue(of({
      theme: 'light'
    } as PreferencesState));
    stateServiceMock.getCurrentState.and.returnValue(mockAppState);

    // Create mock for Router
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    
    // Create mock for ActivatedRoute
    activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        params: {},
        queryParams: {}
      }
    });

    TestBed.configureTestingModule({
      providers: [
        StateFacadeService,
        { provide: StateService, useValue: stateServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    });

    service = TestBed.inject(StateFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication methods', () => {
    it('should check if user is authenticated', (done) => {
      // Setup mock to return authenticated = true
      stateServiceMock.select.and.callFake((selector) => {
        const mockState: AppState = {
          ...mockAppState,
          user: {
            ...mockAppState.user,
            isAuthenticated: true
          }
        };
        return of(selector(mockState));
      });

      service.isAuthenticated().subscribe(isAuthenticated => {
        expect(isAuthenticated).toBe(true);
        done();
      });
    });

    it('should get user roles', (done) => {
      // Setup mock to return roles
      const expectedRoles = ['admin', 'user'];
      stateServiceMock.select.and.callFake((selector) => {
        const mockState: AppState = {
          ...mockAppState,
          user: {
            ...mockAppState.user,
            roles: expectedRoles
          }
        };
        return of(selector(mockState));
      });

      service.getUserRoles().subscribe(roles => {
        expect(roles).toEqual(expectedRoles);
        done();
      });
    });

    it('should set authenticated state', () => {
      const userData = {
        userId: 'test-user-id',
        username: 'testuser',
        roles: ['admin']
      };

      service.setAuthenticated(true, userData);

      expect(stateServiceMock.setAuthState).toHaveBeenCalledWith(
        true, 
        userData
      );
    });

    it('should sign out user', () => {
      service.signOut();

      expect(stateServiceMock.setAuthState).toHaveBeenCalledWith(false);
    });
  });

  describe('UI methods', () => {
    it('should get current theme', (done) => {
      // Setup mock to return theme
      stateServiceMock.getTheme.and.returnValue(of('dark'));

      service.getTheme().subscribe(theme => {
        expect(theme).toBe('dark');
        done();
      });
    });

    it('should set theme', () => {
      service.setTheme('dark');

      expect(stateServiceMock.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should add a notification', () => {
      const mockNotification: Notification = {
        id: '123',
        message: 'Test message',
        type: 'success',
        timestamp: Date.now(),
        read: false
      };
      stateServiceMock.addNotification.and.returnValue(mockNotification);

      const result = service.notify('Test message', 'success');

      expect(stateServiceMock.addNotification).toHaveBeenCalledWith(
        'Test message', 
        'success', 
        undefined
      );
      expect(result).toEqual(mockNotification);
    });

    it('should get notifications', (done) => {
      const mockNotifications: Notification[] = [
        {
          id: '123',
          message: 'Test message',
          type: 'success',
          timestamp: Date.now(),
          read: false
        }
      ];
      stateServiceMock.getNotifications.and.returnValue(of(mockNotifications));

      service.getNotifications().subscribe(notifications => {
        expect(notifications).toEqual(mockNotifications);
        done();
      });
    });

    it('should mark notification as read', () => {
      service.markNotificationAsRead('123');

      expect(stateServiceMock.markNotificationAsRead).toHaveBeenCalledWith('123');
    });

    it('should clear notifications', () => {
      service.clearNotifications();

      expect(stateServiceMock.clearNotifications).toHaveBeenCalled();
    });

    it('should set loading state', () => {
      service.setLoading(true);

      expect(stateServiceMock.setLoading).toHaveBeenCalledWith(true);
    });

    it('should get loading state', (done) => {
      stateServiceMock.getLoading.and.returnValue(of(true));

      service.isLoading().subscribe(isLoading => {
        expect(isLoading).toBe(true);
        done();
      });
    });
  });

  describe('Preferences methods', () => {
    it('should update preferences', () => {
      const preferences: Partial<PreferencesState> = {
        theme: 'dark',
        language: 'en'
      };

      service.updatePreferences(preferences);

      expect(stateServiceMock.updatePreferences).toHaveBeenCalledWith(preferences);
    });

    it('should get preferences', (done) => {
      const mockPreferences: PreferencesState = {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC'
      };
      stateServiceMock.getPreferences.and.returnValue(of(mockPreferences));

      service.getPreferences().subscribe(preferences => {
        expect(preferences).toEqual(mockPreferences);
        done();
      });
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to route', async () => {
      routerMock.navigate.and.returnValue(Promise.resolve(true));

      const result = await service.navigateTo('/home');

      expect(stateServiceMock.setLastViewedPage).toHaveBeenCalledWith('/home');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/home'], undefined);
      expect(result).toBe(true);
    });

    it('should navigate with data', async () => {
      routerMock.navigate.and.returnValue(Promise.resolve(true));
      
      const data = { id: 123 };
      const result = await service.navigateWithData('/user', data);

      expect(stateServiceMock.setLastViewedPage).toHaveBeenCalledWith('/user');
      expect(stateServiceMock.updateState).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/user'], undefined);
      expect(result).toBe(true);
    });

    it('should update query params', async () => {
      routerMock.navigate.and.returnValue(Promise.resolve(true));
      
      const params = { filter: 'active' };
      const result = await service.updateQueryParams(params);

      expect(routerMock.navigate).toHaveBeenCalledWith(
        [], 
        jasmine.objectContaining({
          queryParams: params,
          queryParamsHandling: 'merge'
        })
      );
      expect(result).toBe(true);
    });
  });

  it('should reset state', () => {
    service.resetState();

    expect(stateServiceMock.resetState).toHaveBeenCalled();
  });
}); 