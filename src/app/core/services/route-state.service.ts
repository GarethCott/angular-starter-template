import { Injectable } from '@angular/core';
import { 
  Router, 
  NavigationEnd, 
  ActivatedRoute, 
  NavigationExtras 
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StateService } from './state/state.service';

/**
 * Interface for router state in the global state
 */
export interface RouterState {
  url: string;
  params: Record<string, any>;
  queryParams: Record<string, any>;
  data: Record<string, any>;
  title: string;
  customData?: any;
}

/**
 * Service that integrates the Angular Router with the application state
 * Synchronizes route information with state and enables state-based navigation
 */
@Injectable({
  providedIn: 'root'
})
export class RouteStateService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private stateService: StateService
  ) {
    this.initializeRouteTracking();
  }
  
  /**
   * Setup router event listeners to update state with route information
   */
  private initializeRouteTracking(): void {
    // Track navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Update last viewed page in state
      this.stateService.setLastViewedPage(event.url);
      
      // Store route data in state
      this.updateRouteStateFromSnapshot();
    });
  }
  
  /**
   * Update route state with current route snapshot information
   */
  private updateRouteStateFromSnapshot(): void {
    // Get the deepest activated route
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    // Extract data from route snapshot
    const snapshot = route.snapshot;
    
    // Update state with route information
    this.stateService.updateState({
      router: {
        url: this.router.url,
        params: snapshot.params,
        queryParams: snapshot.queryParams,
        data: snapshot.data,
        title: this.getRouteTitle(snapshot)
      }
    });
  }
  
  /**
   * Extract route title from route data
   */
  private getRouteTitle(snapshot: any): string {
    // Get title from route data
    if (snapshot.data && snapshot.data.title) {
      return snapshot.data.title;
    }
    
    // Try to build title from URL segments
    const segments = this.router.url.split('/').filter(segment => segment.length > 0);
    if (segments.length > 0) {
      // Capitalize last segment
      const lastSegment = segments[segments.length - 1];
      // Remove query params if any
      const cleanSegment = lastSegment.split('?')[0];
      // Replace dashes with spaces and capitalize
      return this.toTitleCase(cleanSegment.replace(/-/g, ' '));
    }
    
    return 'Home';
  }
  
  /**
   * Convert a string to title case
   */
  private toTitleCase(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Navigate to a route and update state
   */
  navigateTo(path: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([path], extras);
  }
  
  /**
   * Navigate to a route with custom data captured in state
   */
  navigateWithData(path: string, data: any, extras?: NavigationExtras): Promise<boolean> {
    // Get current router state or create empty object if it doesn't exist
    const currentState = this.stateService.getCurrentState();
    const currentRouterState = (currentState['router'] as RouterState) || {} as RouterState;
    
    // Store custom data in state before navigation
    this.stateService.updateState({
      router: {
        ...currentRouterState,
        customData: data
      }
    });
    
    return this.router.navigate([path], extras);
  }
  
  /**
   * Get current route information as an observable
   */
  getCurrentRoute(): Observable<RouterState | undefined> {
    return this.stateService.select(state => state['router'] as RouterState | undefined);
  }
  
  /**
   * Get custom data passed during navigation
   */
  getRouteCustomData(): Observable<any> {
    return this.stateService.select(state => {
      const routerState = state['router'] as RouterState | undefined;
      return routerState?.customData;
    });
  }
  
  /**
   * Update URL query parameters without navigation
   * Useful for filters that should appear in the URL
   */
  updateQueryParams(params: any): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
} 