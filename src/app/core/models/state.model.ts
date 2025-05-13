import { RouterState } from '../services/route-state.service';

/**
 * Global application state model
 * Contains all the state slices for the application
 */
export interface AppState {
  user: UserState;
  ui: UIState;
  router?: RouterState;
  filters?: FiltersState;
  preferences?: PreferencesState;
  [key: string]: any; // Allow for dynamic state slices
}

/**
 * User state slice for authentication and user information
 */
export interface UserState {
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  lastLogin?: string;
  profile?: UserProfile;
}

/**
 * UI state slice for general UI-related state
 */
export interface UIState {
  theme: string;
  notifications: Notification[];
  isLoading: boolean;
  lastViewedPage: string;
  sidebarCollapsed?: boolean;
  modals?: {
    [key: string]: boolean;
  };
}

/**
 * User profile model
 */
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  preferences?: {
    [key: string]: any;
  };
}

/**
 * Notification interface for app-wide notifications
 */
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  details?: any;
  metadata?: {
    title?: string;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    showClose?: boolean;
    [key: string]: any;
  };
}

/**
 * Filters state for list filtering
 */
export interface FiltersState {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  pageIndex?: number;
  filters?: {
    [key: string]: any;
  };
}

/**
 * User preferences state
 */
export interface PreferencesState {
  theme: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  accessibility?: {
    highContrast?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
  };
  [key: string]: any;
} 