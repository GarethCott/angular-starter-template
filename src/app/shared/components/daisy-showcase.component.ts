import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  PageLayoutComponent, 
  ContentCardComponent, 
  GridLayoutComponent, 
  BreadcrumbComponent,
  ModalComponent,
  ToastComponent
} from './layout';
import { BreadcrumbItem } from './breadcrumb/breadcrumb.component';
import { ToastService, ToastPosition } from '../services/toast.service';

@Component({
  selector: 'app-daisy-showcase',
  standalone: true,
  imports: [
    CommonModule, 
    PageLayoutComponent, 
    ContentCardComponent, 
    GridLayoutComponent, 
    BreadcrumbComponent,
    ModalComponent,
    ToastComponent
  ],
  templateUrl: './daisy-showcase.component.html',
  styleUrls: ['./daisy-showcase.component.scss']
})
export class DaisyShowcaseComponent {
  // Breadcrumb examples
  basicBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/home' },
    { label: 'Components', url: '/components' },
    { label: 'Breadcrumbs' }
  ];

  iconBreadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Home', 
      url: '/home', 
      icon: BreadcrumbComponent.ICONS.HOME 
    },
    { 
      label: 'Documents', 
      url: '/documents', 
      icon: BreadcrumbComponent.ICONS.FOLDER 
    },
    { 
      label: 'Add Document', 
      icon: BreadcrumbComponent.ICONS.DOCUMENT 
    }
  ];

  longBreadcrumbs: BreadcrumbItem[] = [
    { label: 'First Level', url: '/first' },
    { label: 'Second Level Page', url: '/first/second' },
    { label: 'Third Level Deep', url: '/first/second/third' },
    { label: 'Fourth Level Content', url: '/first/second/third/fourth' },
    { label: 'Fifth Level Detail' }
  ];
  
  // Modal examples
  isBasicModalOpen = false;
  isLargeModalOpen = false;
  isSmallModalOpen = false;
  isInfoModalOpen = false;
  
  // Toast position options
  toastPositions: ToastPosition[] = [
    'top-right', 'top-left', 'bottom-right', 
    'bottom-left', 'top-center', 'bottom-center'
  ];
  selectedToastPosition: ToastPosition = 'top-right';
  
  constructor(private toastService: ToastService) {}
  
  openModal(modalType: string): void {
    switch(modalType) {
      case 'basic':
        this.isBasicModalOpen = true;
        break;
      case 'large':
        this.isLargeModalOpen = true;
        break;
      case 'small':
        this.isSmallModalOpen = true;
        break;
      case 'info':
        this.isInfoModalOpen = true;
        break;
    }
  }
  
  closeModal(modalType: string): void {
    switch(modalType) {
      case 'basic':
        this.isBasicModalOpen = false;
        break;
      case 'large':
        this.isLargeModalOpen = false;
        break;
      case 'small':
        this.isSmallModalOpen = false;
        break;
      case 'info':
        this.isInfoModalOpen = false;
        break;
    }
  }
  
  // Toast methods
  showInfoToast(): void {
    this.toastService.info('This is an information message', {
      title: 'Information',
      position: this.selectedToastPosition,
      duration: 3000
    });
  }
  
  showSuccessToast(): void {
    this.toastService.success('Operation completed successfully', { 
      title: 'Success',
      position: this.selectedToastPosition, 
      duration: 3000
    });
  }
  
  showWarningToast(): void {
    this.toastService.warning('This action may have consequences', { 
      title: 'Warning', 
      position: this.selectedToastPosition,
      duration: 4000
    });
  }
  
  showErrorToast(): void {
    this.toastService.error('An error occurred while processing your request', { 
      title: 'Error', 
      position: this.selectedToastPosition,
      duration: 5000
    });
  }
  
  showCustomToast(): void {
    this.toastService.show(
      'This is a custom message with longer duration',
      'info',
      { 
        title: 'Custom Toast', 
        position: this.selectedToastPosition,
        duration: 8000
      }
    );
  }
  
  setToastPosition(position: ToastPosition): void {
    this.selectedToastPosition = position;
  }
  
  clearAllToasts(): void {
    this.toastService.clear();
  }
} 