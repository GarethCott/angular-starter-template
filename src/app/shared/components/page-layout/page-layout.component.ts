import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from '../container/container.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, ContainerComponent],
  template: `
    <div class="min-h-[80vh] w-full">
      <app-container [size]="size" [padding]="padding" [withCard]="withCard" [additionalClasses]="additionalClasses">
        <!-- Page Header -->
        <div *ngIf="title" class="mb-6">
          <h1 class="text-2xl font-bold">{{title}}</h1>
          <p *ngIf="subtitle" class="text-sm opacity-70 mt-1">{{subtitle}}</p>
          <div *ngIf="withDivider" class="divider mt-2"></div>
        </div>

        <!-- Page Content -->
        <div class="page-content">
          <ng-content></ng-content>
        </div>
      </app-container>
    </div>
  `
})
export class PageLayoutComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() withDivider = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() withCard = false;
  @Input() additionalClasses = '';
} 