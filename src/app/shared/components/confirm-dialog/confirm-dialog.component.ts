import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  header?: string;
  footer?: string;
  confirmText?: string;
  cancelText?: string;
  showLoading?: boolean;
  errorMessage?: string;
  onConfirm?: () => Promise<any> | void;
  onCancel?: () => void;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ConfirmDialogComponent {
  isLoading = false;
  currentErrorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default values
    this.data.confirmText = this.data.confirmText || 'Confirm';
    this.data.cancelText = this.data.cancelText || 'Cancel';
    this.data.showLoading = this.data.showLoading ?? true;
    this.currentErrorMessage = this.data.errorMessage || null;
  }

  async onConfirm(): Promise<void> {
    if (this.data.onConfirm) {
      try {
        this.isLoading = true;
        this.currentErrorMessage = null;

        const result = this.data.onConfirm();
        if (result instanceof Promise) {
          await result;
        }

        this.dialogRef.close(true);
      } catch (error) {
        console.error('Confirm action failed:', error);
        this.currentErrorMessage = error instanceof Error ? error.message : 'An error occurred';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    if (this.data.onCancel) {
      this.data.onCancel();
    }
    this.dialogRef.close(false);
  }

  dismissError(): void {
    this.currentErrorMessage = null;
  }
}
