import { Component, OnInit, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/ui';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';
import { 
  StatePersistenceService, 
  StateEffectsService, 
  StateDebugService, 
  RouteStateService 
} from './core/services/state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoadingIndicatorComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-loading-indicator></app-loading-indicator>
  `
})
export class AppComponent implements OnInit {
  title = 'angular-starter-template';
  
  constructor(
    private themeService: ThemeService,
    private statePersistenceService: StatePersistenceService,
    private stateEffectsService: StateEffectsService,
    private routeStateService: RouteStateService,
    // Only inject in development mode
    private stateDebugService: StateDebugService
  ) {}
  
  ngOnInit(): void {
    // Initialize theme service (will use state service internally)
    this.themeService.currentTheme$.subscribe();
    
    // Log initialization in development mode
    if (isDevMode()) {
      console.log('State management services initialized');
    }
  }
}
