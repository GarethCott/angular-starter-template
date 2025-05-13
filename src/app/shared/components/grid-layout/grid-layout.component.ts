import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid {{columnsClass}} {{gapClass}} {{additionalClasses}}">
      <ng-content></ng-content>
    </div>
  `
})
export class GridLayoutComponent {
  @Input() columns: 1 | 2 | 3 | 4 | 6 | 12 = 3; 
  @Input() gap: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() additionalClasses = '';
  
  get columnsClass(): string {
    return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${this.columns}`;
  }
  
  get gapClass(): string {
    const gaps = {
      'none': 'gap-0',
      'sm': 'gap-2',
      'md': 'gap-4',
      'lg': 'gap-8'
    };
    return gaps[this.gap];
  }
} 