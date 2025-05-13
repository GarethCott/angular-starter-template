import { Injectable, inject, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { StateFacadeService } from '../state/state-facade.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private renderer: Renderer2;
  
  // All available daisyUI themes (all 35) + our custom Angular theme
  private _availableThemes = [
    // Custom theme
    "angular",
    // Standard daisyUI themes
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
    "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
    "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", 
    "business", "acid", "lemonade", "night", "coffee", "winter", 
    "dim", "nord", "sunset", "caramellatte", "abyss", "silk"
  ];
  
  // Observable for components to subscribe to
  public currentTheme$: Observable<string>;
  
  constructor(
    rendererFactory: RendererFactory2,
    private stateFacade: StateFacadeService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Get theme from state and apply it when it changes
    this.currentTheme$ = this.stateFacade.getTheme().pipe(
      tap(theme => {
        if (this._availableThemes.includes(theme)) {
          this.applyTheme(theme);
        } else {
          // Fall back to default theme if invalid
          const defaultTheme = 'angular';
          this.stateFacade.setTheme(defaultTheme);
          this.applyTheme(defaultTheme);
        }
      })
    );
    
    if (isPlatformBrowser(this.platformId)) {
      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          // Only update if user hasn't explicitly chosen a theme (checking localStorage)
          if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'angular';
            this.stateFacade.setTheme(newTheme);
          }
        });
      }
    }
  }
  
  // Get all available themes
  get availableThemes(): string[] {
    return [...this._availableThemes];
  }
  
  // Get current theme value
  get currentTheme(): string {
    // This is a synchronous getter, which requires us to look in localStorage
    // The reactive version should use currentTheme$ observable
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && this._availableThemes.includes(savedTheme)) {
        return savedTheme;
      }
    }
    return 'angular'; // Default
  }
  
  // Set and apply a new theme
  setTheme(theme: string): void {
    if (!this._availableThemes.includes(theme)) {
      console.warn(`Theme "${theme}" is not available.`);
      return;
    }
    
    this.stateFacade.setTheme(theme);
  }
  
  // Clear user preference and revert to system preference
  clearThemePreference(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('theme');
      
      // Set theme based on system preference, but use angular theme as light
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'angular';
      
      this.stateFacade.setTheme(systemTheme);
    }
  }
  
  // Apply the theme to the HTML element
  private applyTheme(theme: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.querySelector('html');
      if (html) {
        this.renderer.setAttribute(html, 'data-theme', theme);
      }
    }
  }
} 