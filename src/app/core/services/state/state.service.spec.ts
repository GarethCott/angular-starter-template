import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { AppState, Notification } from '../../models/state.model';
import { skip, take, toArray } from 'rxjs/operators';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [StateService]
    });
    
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('state management', () => {
    it('should initialize with default state', () => {
      const initialState = service.getCurrentState();
      
      expect(initialState).toBeDefined();
      expect(initialState.user.isAuthenticated).toBe(false);
      expect(initialState.ui.theme).toBe('light');
      expect(initialState.ui.notifications).toEqual([]);
      expect(initialState.ui.isLoading).toBe(false);
    });
    
    it('should update state correctly', () => {
      // Initial state check
      const initialState = service.getCurrentState();
      expect(initialState.user.isAuthenticated).toBe(false);
      
      // Update state
      service.updateState({
        user: {
          isAuthenticated: true,
          username: 'testuser'
        }
      });
      
      // Check state was updated
      const updatedState = service.getCurrentState();
      expect(updatedState.user.isAuthenticated).toBe(true);
      expect(updatedState.user.username).toBe('testuser');
      
      // Ensure other state slices remain unchanged
      expect(updatedState.ui).toEqual(initialState.ui);
    });
    
    it('should reset state to initial values', () => {
      // First update the state
      service.updateState({
        user: {
          isAuthenticated: true,
          username: 'testuser'
        },
        ui: {
          theme: 'dark',
          isLoading: true,
          notifications: [{
            id: '1',
            message: 'Test',
            type: 'info',
            timestamp: Date.now(),
            read: false
          }],
          lastViewedPage: '/home',
          sidebarCollapsed: true
        }
      });
      
      // Then reset it
      service.resetState();
      
      // Check state was reset
      const resetState = service.getCurrentState();
      expect(resetState.user.isAuthenticated).toBe(false);
      expect(resetState.user.username).toBeUndefined();
      expect(resetState.ui.theme).toBe('light');
      expect(resetState.ui.notifications).toEqual([]);
      expect(resetState.ui.isLoading).toBe(false);
      expect(resetState.ui.lastViewedPage).toBe('');
    });
    
    it('should select state slices correctly', (done) => {
      // Update state with test data
      service.updateState({
        user: {
          isAuthenticated: true,
          username: 'testuser'
        }
      });
      
      // Select a slice of state
      service.select(state => state.user.username)
        .pipe(take(1))
        .subscribe(username => {
          expect(username).toBe('testuser');
          done();
        });
    });
    
    it('should emit state updates to subscribers', (done) => {
      // Collect states as they're emitted
      service.getState()
        .pipe(
          skip(1), // Skip initial state
          take(1)
        )
        .subscribe(state => {
          expect(state.user.isAuthenticated).toBe(true);
          expect(state.user.username).toBe('testuser');
          done();
        });
      
      // Update state to trigger emission
      service.updateState({
        user: {
          isAuthenticated: true,
          username: 'testuser'
        }
      });
    });
  });

  describe('authentication state', () => {
    it('should update authentication state', () => {
      service.setAuthState(true, {
        userId: 'user123',
        username: 'testuser',
        roles: ['user', 'admin']
      });
      
      const state = service.getCurrentState();
      expect(state.user.isAuthenticated).toBe(true);
      expect(state.user.userId).toBe('user123');
      expect(state.user.username).toBe('testuser');
      expect(state.user.roles).toEqual(['user', 'admin']);
    });
    
    it('should clear user data when setting unauthenticated', () => {
      // First set as authenticated
      service.setAuthState(true, {
        userId: 'user123',
        username: 'testuser',
        roles: ['user']
      });
      
      // Then set as unauthenticated
      service.setAuthState(false);
      
      const state = service.getCurrentState();
      expect(state.user.isAuthenticated).toBe(false);
      expect(state.user.userId).toBeUndefined();
      expect(state.user.username).toBeUndefined();
      expect(state.user.roles).toBeUndefined();
    });
  });

  describe('theme management', () => {
    it('should get and set theme', (done) => {
      // Set theme
      service.setTheme('dark');
      
      // Check current state
      expect(service.getCurrentState().ui.theme).toBe('dark');
      expect(service.getCurrentState().preferences?.theme).toBe('dark');
      
      // Check localStorage was updated
      expect(localStorage.getItem('theme')).toBe('dark');
      
      // Check observable value
      service.getTheme()
        .pipe(take(1))
        .subscribe(theme => {
          expect(theme).toBe('dark');
          done();
        });
    });
    
    it('should initialize theme from localStorage', () => {
      // Set theme in localStorage first
      localStorage.setItem('theme', 'light');
      
      // Create new instance of service (to test initialization)
      service = TestBed.inject(StateService);
      
      // Check theme was loaded from localStorage
      expect(service.getCurrentState().ui.theme).toBe('light');
      expect(service.getCurrentState().preferences?.theme).toBe('light');
    });
  });

  describe('notifications', () => {
    it('should add a notification', () => {
      const result = service.addNotification('Test message', 'success');
      
      // Check notification was added to state
      const state = service.getCurrentState();
      expect(state.ui.notifications.length).toBe(1);
      expect(state.ui.notifications[0].message).toBe('Test message');
      expect(state.ui.notifications[0].type).toBe('success');
      expect(state.ui.notifications[0].read).toBe(false);
      
      // Check returned notification matches
      expect(result.message).toBe('Test message');
      expect(result.type).toBe('success');
    });
    
    it('should mark notification as read', () => {
      // Add notification first
      const notification = service.addNotification('Test message', 'info');
      
      // Mark as read
      service.markNotificationAsRead(notification.id);
      
      // Check notification was updated
      const state = service.getCurrentState();
      expect(state.ui.notifications[0].read).toBe(true);
    });
    
    it('should clear all notifications', () => {
      // Add multiple notifications
      service.addNotification('Test 1', 'info');
      service.addNotification('Test 2', 'warning');
      
      // Clear notifications
      service.clearNotifications();
      
      // Check notifications were cleared
      const state = service.getCurrentState();
      expect(state.ui.notifications.length).toBe(0);
    });
    
    it('should get notifications as observable', (done) => {
      // Add notification
      service.addNotification('Test message', 'success');
      
      // Get notifications and check
      service.getNotifications()
        .pipe(take(1))
        .subscribe(notifications => {
          expect(notifications.length).toBe(1);
          expect(notifications[0].message).toBe('Test message');
          done();
        });
    });
  });

  describe('loading state', () => {
    it('should set and get loading state', (done) => {
      // Start with loading = false
      expect(service.getCurrentState().ui.isLoading).toBe(false);
      
      // Set loading state
      service.setLoading(true);
      
      // Check current state
      expect(service.getCurrentState().ui.isLoading).toBe(true);
      
      // Check observable
      service.getLoading()
        .pipe(take(1))
        .subscribe(isLoading => {
          expect(isLoading).toBe(true);
          done();
        });
    });
  });

  describe('last viewed page', () => {
    it('should set and get last viewed page', (done) => {
      // Set last viewed page
      service.setLastViewedPage('/profile');
      
      // Check current state
      expect(service.getCurrentState().ui.lastViewedPage).toBe('/profile');
      
      // Check observable
      service.getLastViewedPage()
        .pipe(take(1))
        .subscribe(page => {
          expect(page).toBe('/profile');
          done();
        });
    });
  });

  describe('sidebar state', () => {
    it('should toggle sidebar collapsed state', (done) => {
      // Initial state should be false
      expect(service.getCurrentState().ui.sidebarCollapsed).toBe(false);
      
      // Toggle sidebar
      service.toggleSidebar();
      
      // Should now be true
      expect(service.getCurrentState().ui.sidebarCollapsed).toBe(true);
      
      // Check observable
      service.getSidebarCollapsed()
        .pipe(take(1))
        .subscribe(collapsed => {
          expect(collapsed).toBe(true);
          done();
        });
    });
  });

  describe('preferences', () => {
    it('should update and get preferences', (done) => {
      // Update preferences
      service.updatePreferences({
        theme: 'dark',
        language: 'fr',
        timezone: 'Europe/Paris'
      });
      
      // Check current state
      const state = service.getCurrentState();
      expect(state.preferences?.theme).toBe('dark');
      expect(state.preferences?.language).toBe('fr');
      expect(state.preferences?.timezone).toBe('Europe/Paris');
      
      // Check observable
      service.getPreferences()
        .pipe(take(1))
        .subscribe(prefs => {
          expect(prefs?.theme).toBe('dark');
          expect(prefs?.language).toBe('fr');
          expect(prefs?.timezone).toBe('Europe/Paris');
          done();
        });
    });
  });

  describe('deep merge functionality', () => {
    it('should deep merge nested objects correctly', () => {
      // Setup initial nested state
      service.updateState({
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        }
      });
      
      // Partially update nested structure
      service.updateState({
        preferences: {
          theme: 'dark',
          notifications: {
            push: false
          }
        }
      });
      
      // Check result has correct merge
      const state = service.getCurrentState();
      expect(state.preferences?.theme).toBe('dark');
      expect(state.preferences?.language).toBe('en'); // preserved
      expect(state.preferences?.notifications?.email).toBe(true); // preserved
      expect(state.preferences?.notifications?.push).toBe(false); // updated
      expect(state.preferences?.notifications?.inApp).toBe(true); // preserved
    });
  });
}); 