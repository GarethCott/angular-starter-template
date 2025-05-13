import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-base-100 shadow-xl {{additionalClasses}}">
      <div class="card-body {{paddingClass}}">
        <!-- Card Header -->
        <div *ngIf="title" class="card-header mb-4">
          <h2 class="card-title">{{title}}</h2>
          <p *ngIf="subtitle" class="text-sm opacity-70">{{subtitle}}</p>
          <div *ngIf="withDivider" class="divider mt-2 mb-0"></div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <ng-content></ng-content>
        </div>
        
        <!-- Card Actions -->
        <div *ngIf="hasActions" class="card-actions justify-end mt-4">
          <ng-content select="[cardActions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ContentCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() withDivider = false;
  @Input() hasActions = false;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() additionalClasses = '';
  
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