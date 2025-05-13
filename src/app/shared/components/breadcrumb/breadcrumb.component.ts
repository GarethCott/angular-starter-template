import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="breadcrumbs text-sm {{additionalClasses}}">
      <ul>
        <li *ngFor="let item of items; let last = last">
          <ng-container *ngIf="!last && item.url">
            <a [routerLink]="item.url" class="inline-flex items-center gap-2">
              <svg *ngIf="item.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current">
                <path [attr.d]="item.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              {{item.label}}
            </a>
          </ng-container>
          <ng-container *ngIf="!last && !item.url">
            <span class="inline-flex items-center gap-2">
              <svg *ngIf="item.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current">
                <path [attr.d]="item.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              {{item.label}}
            </span>
          </ng-container>
          <ng-container *ngIf="last">
            <span class="inline-flex items-center gap-2">
              <svg *ngIf="item.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current">
                <path [attr.d]="item.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              {{item.label}}
            </span>
          </ng-container>
        </li>
      </ul>
    </div>
  `
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() additionalClasses = '';

  // Predefined icon paths for common items
  static readonly ICONS = {
    HOME: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    FOLDER: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    DOCUMENT: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };
} 