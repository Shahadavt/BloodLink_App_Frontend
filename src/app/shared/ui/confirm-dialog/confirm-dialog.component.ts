import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  data: ConfirmDialogData = {
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  };

  visible = false;
  onConfirm: () => void = () => {};
  onCancel: () => void = () => {};

  show(data: ConfirmDialogData, onConfirm: () => void, onCancel?: () => void) {
    this.data = { ...this.data, ...data };
    this.onConfirm = onConfirm;
    this.onCancel = onCancel || (() => {});
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  confirm() {
    this.onConfirm();
    this.hide();
  }

  cancel() {
    this.onCancel();
    this.hide();
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'warning';
      case 'warning': return 'help_outline';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getIconColor(): string {
    switch (this.data.type) {
      case 'danger': return '#DC2626';
      case 'warning': return '#F59E0B';
      case 'info': return '#2563EB';
      default: return '#2563EB';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.data.type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'info': return 'btn-primary';
      default: return 'btn-primary';
    }
  }
}
