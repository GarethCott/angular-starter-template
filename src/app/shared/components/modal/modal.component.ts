import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() id: string = `modal-${Math.random().toString(36).substring(2, 9)}`;
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() size: ModalSize = 'md';
  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    this.updateDialogState();
  }
  get isOpen(): boolean {
    return this._isOpen;
  }
  @Input() hideFooter: boolean = false;

  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  @ContentChild('modalBody') modalBodyTemplate?: TemplateRef<any>;
  @ContentChild('modalFooter') modalFooterTemplate?: TemplateRef<any>;
  @ViewChild('modalDialog', { static: false }) modalDialogRef!: ElementRef<HTMLDialogElement>;

  private _isOpen = false;
  private dialogElement: HTMLDialogElement | null = null;
  private closeListener: (() => void) | null = null;

  ngAfterViewInit(): void {
    // Wait for the dialog element to be available in the DOM
    setTimeout(() => {
      this.dialogElement = document.getElementById(this.id) as HTMLDialogElement;
      
      if (this.dialogElement) {
        // Add event listener for close event (triggered when ESC is pressed)
        this.closeListener = () => {
          this._isOpen = false;
          this.closed.emit();
        };
        this.dialogElement.addEventListener('close', this.closeListener);
      }
      
      this.updateDialogState();
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.dialogElement && this.closeListener) {
      this.dialogElement.removeEventListener('close', this.closeListener);
    }
  }

  updateDialogState(): void {
    // Try to get the dialog element from ViewChild first, then fallback to getElementById
    if (this.modalDialogRef?.nativeElement) {
      this.dialogElement = this.modalDialogRef.nativeElement;
    } else if (!this.dialogElement) {
      this.dialogElement = document.getElementById(this.id) as HTMLDialogElement;
    }
    
    if (!this.dialogElement) return;
    
    if (this._isOpen) {
      if (!this.dialogElement.open) {
        this.dialogElement.showModal();
        this.opened.emit();
      }
    } else {
      if (this.dialogElement.open) {
        this.dialogElement.close();
      }
    }
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  getSizeClass(): string {
    switch(this.size) {
      case 'xs': return 'modal-xs';
      case 'sm': return 'modal-sm';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      default: return ''; // md is the default size
    }
  }
} 