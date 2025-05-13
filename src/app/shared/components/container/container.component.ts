import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="w-full mx-auto {{sizeClass}} {{paddingClass}} {{additionalClasses}}"
      [ngClass]="{'bg-base-100 shadow-lg rounded-lg': withCard}"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class ContainerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() withCard = false;
  @Input() additionalClasses = '';

  get sizeClass(): string {
    const sizes = {
      'sm': 'max-w-screen-sm',
      'md': 'max-w-screen-md',
      'lg': 'max-w-screen-lg',
      'xl': 'max-w-screen-xl',
      'full': 'max-w-full'
    };
    return sizes[this.size];
  }

  get paddingClass(): string {
    const paddings = {
      'none': 'p-0',
      'sm': 'p-2',
      'md': 'p-4',
      'lg': 'p-8'
    };
    return paddings[this.padding];
  }
} 