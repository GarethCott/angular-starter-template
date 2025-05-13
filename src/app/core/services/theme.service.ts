import { Injectable, inject, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

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
  
  // Theme state with BehaviorSubject for reactivity
  private _currentTheme = new BehaviorSubject<string>("angular");
  
  // Observable for components to subscribe to
  public currentTheme$ = this._currentTheme.asObservable();
  
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    if (isPlatformBrowser(this.platformId)) {
      // Load theme from localStorage on initialization
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme && this._availableThemes.includes(savedTheme)) {
        // Use saved theme from localStorage
        this._currentTheme.next(savedTheme);
        this.applyTheme(savedTheme);
      } else {
        // Set Angular theme as default if no saved theme
        const defaultTheme = 'angular';
        this._currentTheme.next(defaultTheme);
        this.applyTheme(defaultTheme);
      }
      
      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          if (!localStorage.getItem('theme')) {
            // Only update if user hasn't explicitly chosen a theme
            const newTheme = e.matches ? 'dark' : 'angular';
            this._currentTheme.next(newTheme);
            this.applyTheme(newTheme);
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
    return this._currentTheme.value;
  }
  
  // Set and apply a new theme
  setTheme(theme: string): void {
    if (!this._availableThemes.includes(theme)) {
      console.warn(`Theme "${theme}" is not available.`);
      return;
    }
    
    this._currentTheme.next(theme);
    this.applyTheme(theme);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
  }
  
  // Clear user preference and revert to system preference
  clearThemePreference(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('theme');
      
      // Set theme based on system preference, but use angular theme as light
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'angular';
      
      this._currentTheme.next(systemTheme);
      this.applyTheme(systemTheme);
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