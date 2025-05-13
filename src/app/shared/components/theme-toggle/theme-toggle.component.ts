import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  basicThemes: string[] = ['light', 'dark'];
  availableThemes: string[] = [];
  currentTheme: string = 'angular';
  isUsingSystemTheme: boolean = false;
  private themeSubscription: Subscription | null = null;

  // Theme categories
  lightCategoryThemes: string[] = [];
  darkCategoryThemes: string[] = [];
  specialCategoryThemes: string[] = [];

  // Theme classification
  private readonly lightThemes: string[] = [
    'light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
    'lofi', 'pastel', 'fantasy', 'wireframe', 'cmyk', 
    'autumn', 'business', 'acid', 'lemonade', 'winter'
  ];
  
  private readonly darkThemes: string[] = [
    'dark', 'synthwave', 'halloween', 'forest', 'aqua', 
    'black', 'luxury', 'dracula', 'night', 'coffee', 'dim', 'sunset'
  ];
  
  private readonly specialThemes: string[] = [
    'retro', 'cyberpunk', 'valentine', 'garden', 'nord', 
    'caramellatte', 'abyss', 'silk'
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.availableThemes = this.themeService.availableThemes;
    this.organizeThemesIntoCategories();
    
    // Check if using system theme (no localStorage entry)
    this.isUsingSystemTheme = !localStorage.getItem('theme');
    
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe((theme: string) => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
    this.isUsingSystemTheme = false;
  }
  
  useSystemTheme(): void {
    this.themeService.clearThemePreference();
    this.isUsingSystemTheme = true;
  }
  
  private organizeThemesIntoCategories(): void {
    // Filter to remove basic themes and the angular theme, and ensure theme is available
    const themesToCategorize = this.availableThemes.filter(theme => 
      !this.basicThemes.includes(theme) && theme !== 'angular'
    );
    
    // Populate theme categories
    this.lightCategoryThemes = themesToCategorize.filter(theme => 
      this.lightThemes.includes(theme) && !this.basicThemes.includes(theme)
    );
    
    this.darkCategoryThemes = themesToCategorize.filter(theme => 
      this.darkThemes.includes(theme) && !this.basicThemes.includes(theme)
    );
    
    this.specialCategoryThemes = themesToCategorize.filter(theme => 
      this.specialThemes.includes(theme)
    );
  }
} 