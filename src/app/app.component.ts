import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';

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
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Initialize theme service (will use state service internally)
    this.themeService.currentTheme$.subscribe();
  }
}
