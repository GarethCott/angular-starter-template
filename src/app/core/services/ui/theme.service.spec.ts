import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { StateFacadeService } from '../state/state-facade.service';
import { PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { of } from 'rxjs';

describe('ThemeService', () => {
  let service: ThemeService;
  let stateFacadeMock: jasmine.SpyObj<StateFacadeService>;
  let localStorageSpy: jasmine.Spy;
  let rendererMock: jasmine.SpyObj<Renderer2>;
  let rendererFactoryMock: jasmine.SpyObj<RendererFactory2>;
  let documentQuerySelectorSpy: jasmine.Spy;
  let mockHtmlElement: any;

  beforeEach(() => {
    // Create a mock HTML element for testing DOM interactions
    mockHtmlElement = {
      getAttribute: jasmine.createSpy('getAttribute'),
      setAttribute: jasmine.createSpy('setAttribute')
    };

    // Spy on document.querySelector to return our mock element
    documentQuerySelectorSpy = spyOn(document, 'querySelector').and.returnValue(mockHtmlElement);

    // Mock for StateFacadeService
    stateFacadeMock = jasmine.createSpyObj('StateFacadeService', [
      'getTheme',
      'setTheme'
    ]);
    
    // Default theme is light
    stateFacadeMock.getTheme.and.returnValue(of('light'));

    // Mock localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    // Create Renderer mock
    rendererMock = jasmine.createSpyObj('Renderer2', ['setAttribute']);
    
    // Create RendererFactory mock that returns our rendererMock
    rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: StateFacadeService, useValue: stateFacadeMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: RendererFactory2, useValue: rendererFactoryMock }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('theme management', () => {
    it('should provide a list of available themes', () => {
      const themes = service.availableThemes;
      expect(themes.length).toBeGreaterThan(0);
      expect(themes).toContain('angular');
      expect(themes).toContain('dark');
      expect(themes).toContain('light');
    });

    it('should get the current theme from localStorage', () => {
      // Setup localStorage to return a theme
      localStorageSpy.and.returnValue('dark');
      
      // Re-inject service so constructor can use the mocked localStorage
      service = TestBed.inject(ThemeService);
      
      expect(service.currentTheme).toBe('dark');
      expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should default to angular theme if localStorage has no theme', () => {
      // Ensure localStorage returns null (default mock behavior)
      localStorageSpy.and.returnValue(null);
      
      // Re-inject service
      service = TestBed.inject(ThemeService);
      
      expect(service.currentTheme).toBe('angular');
    });

    it('should set a new theme', () => {
      service.setTheme('dark');
      
      expect(stateFacadeMock.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should not set an invalid theme', () => {
      // Log spy to check warning
      spyOn(console, 'warn');
      
      service.setTheme('not-a-real-theme');
      
      expect(stateFacadeMock.setTheme).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should apply theme to HTML element when theme changes', () => {
      // Initial render should have queried for html element
      expect(document.querySelector).toHaveBeenCalledWith('html');

      // Initially light theme should be set
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        mockHtmlElement,
        'data-theme',
        'light'
      );
      
      // Now change theme to dark
      rendererMock.setAttribute.calls.reset();
      stateFacadeMock.getTheme.and.returnValue(of('dark'));
      
      // Re-inject service to trigger constructor and the subscription
      service = TestBed.inject(ThemeService);
      
      // Should use renderer to set attribute
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        mockHtmlElement,
        'data-theme',
        'dark'
      );
    });
  });

  describe('system preference handling', () => {
    it('should clear theme preference and use system preference', () => {
      // Mock window.matchMedia
      const originalMatchMedia = window.matchMedia;
      
      // Mock matchMedia to return dark mode preference
      (window as any).matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: true, // Dark mode
        addEventListener: jasmine.createSpy('addEventListener')
      });
      
      service.clearThemePreference();
      
      // Should remove from localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('theme');
      
      // Should check system preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      
      // Should set theme based on system preference (dark)
      expect(stateFacadeMock.setTheme).toHaveBeenCalledWith('dark');
      
      // Restore original matchMedia
      (window as any).matchMedia = originalMatchMedia;
    });
    
    it('should use angular theme when system preference is light', () => {
      // Mock window.matchMedia
      const originalMatchMedia = window.matchMedia;
      
      // Mock matchMedia to return light mode preference
      (window as any).matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false, // Light mode
        addEventListener: jasmine.createSpy('addEventListener')
      });
      
      service.clearThemePreference();
      
      // Should set theme to angular (light theme)
      expect(stateFacadeMock.setTheme).toHaveBeenCalledWith('angular');
      
      // Restore original matchMedia
      (window as any).matchMedia = originalMatchMedia;
    });
  });

  describe('theme subscription', () => {
    it('should handle invalid themes by falling back to default', () => {
      // Mock invalid theme
      rendererMock.setAttribute.calls.reset();
      stateFacadeMock.getTheme.and.returnValue(of('invalid-theme'));
      
      // Re-inject service to trigger the subscription
      service = TestBed.inject(ThemeService);
      
      // Should fall back to angular theme
      expect(stateFacadeMock.setTheme).toHaveBeenCalledWith('angular');
      
      // Should set the theme attribute
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        mockHtmlElement,
        'data-theme',
        'angular'
      );
    });
  });
}); 