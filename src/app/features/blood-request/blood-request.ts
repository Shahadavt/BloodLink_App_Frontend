import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BloodService, BloodRequest } from '../../core/services/blood';
import { RequesterService } from '../../core/services/requester';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-blood-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blood-request.html',
  styleUrls: ['./blood-request.css']
})
export class BloodRequestComponent implements OnInit {
  request: BloodRequest = {
    patientName: '',
    bloodGroup: '',
    hospital: '',
    city: '',
    unitsRequired: 1,
    contactNumber: ''
  };

  message = '';
  isError = false;
  isEditing = false;
  requestId: number | null = null;
  loading = false;
  isSubmitting = false;

  constructor(
    private bloodService: BloodService,
    private requesterService: RequesterService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if editing an existing request
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.isEditing = true;
      this.requestId = Number(id);
      this.loadRequest(this.requestId);
    }
  }

  loadRequest(id: number): void {
    console.log('Loading request ID:', id);
    this.loading = true;
    this.cdr.detectChanges();
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    this.bloodService.getRequest(id).subscribe({
      next: (request) => {
        console.log('Request loaded successfully:', request);
        console.log('Setting request data and clearing loading state');
        this.request = request;
        this.loading = false;
        console.log('Loading state:', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading request:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        this.message = 'Error loading request: ' + (err.error?.message || err.message || 'Unknown error');
        this.isError = true;
        this.loading = false;
        console.log('Loading state after error:', this.loading);
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load request', 'Close', { duration: 5000 });
      }
    });
  }

  validateForm(): boolean {
    if (!this.request.patientName || this.request.patientName.trim().length < 2) {
      this.message = 'Please enter a valid patient name (at least 2 characters)';
      this.isError = true;
      return false;
    }
    if (!this.request.bloodGroup) {
      this.message = 'Please select a blood group';
      this.isError = true;
      return false;
    }
    if (!this.request.hospital || this.request.hospital.trim().length < 2) {
      this.message = 'Please enter a valid hospital name (at least 2 characters)';
      this.isError = true;
      return false;
    }
    if (!this.request.city || this.request.city.trim().length < 2) {
      this.message = 'Please enter a valid city (at least 2 characters)';
      this.isError = true;
      return false;
    }
    if (!this.request.unitsRequired || this.request.unitsRequired < 1) {
      this.message = 'Please enter a valid number of units (at least 1)';
      this.isError = true;
      return false;
    }
    if (!this.request.contactNumber || this.request.contactNumber.trim().length < 10) {
      this.message = 'Please enter a valid contact number (at least 10 digits)';
      this.isError = true;
      return false;
    }
    return true;
  }

  submitRequest() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    this.isError = false;

    if (this.isEditing && this.requestId) {
      // Update existing request
      console.log('Updating request ID:', this.requestId);
      console.log('Request data:', this.request);
      console.log('User role:', this.getUserRole());
      
      const userRole = this.getUserRole();
      
      if (userRole === 'ADMIN') {
        // Admin uses blood service for update
        this.bloodService.updateRequest(this.requestId, this.request).subscribe({
          next: (response) => {
            console.log('Admin request updated successfully. Response:', response);
            this.message = "Request updated successfully!";
            this.isError = false;
            this.isSubmitting = false;
            this.cdr.detectChanges();
            this.snackBar.open('Request updated successfully', 'Close', { duration: 3000 });
            setTimeout(() => this.router.navigate(['/my-board']), 2000);
          },
          error: (err) => {
            console.error('Error updating request (admin):', err);
            console.error('Error status:', err.status);
            console.error('Error message:', err.message);
            console.error('Error details:', err.error);
            this.message = "Error: Could not update request. " + (err.error?.message || err.message || 'Unknown error');
            this.isError = true;
            this.isSubmitting = false;
            this.cdr.detectChanges();
            this.snackBar.open('Failed to update request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      } else {
        // Requester uses requester service for update
        this.requesterService.updateRequest(this.requestId, this.request).subscribe({
          next: (response) => {
            console.log('Requester request updated successfully. Response:', response);
            this.message = "Request updated successfully!";
            this.isError = false;
            this.isSubmitting = false;
            this.cdr.detectChanges();
            this.snackBar.open('Request updated successfully', 'Close', { duration: 3000 });
            setTimeout(() => this.router.navigate(['/my-board']), 2000);
          },
          error: (err) => {
            console.error('Error updating request (requester):', err);
            console.error('Error status:', err.status);
            console.error('Error message:', err.message);
            console.error('Error details:', err.error);
            this.message = "Error: Could not update request. " + (err.error?.message || err.message || 'Unknown error');
            this.isError = true;
            this.isSubmitting = false;
            this.cdr.detectChanges();
            this.snackBar.open('Failed to update request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    } else {
      // Create new request
      this.bloodService.createRequest(this.request).subscribe({
        next: () => {
          this.message = "Request successfully broadcasted!";
          this.isError = false;
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Request created successfully', 'Close', { duration: 3000 });
          setTimeout(() => this.router.navigate(['/requester/requests']), 2000);
        },
        error: (err) => {
          console.error('Error creating request:', err);
          this.message = "Error: Could not send request.";
          this.isError = true;
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Failed to create request', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch (e) {
      return '';
    }
  }

  cancel(): void {
    if (this.isEditing) {
      this.router.navigate(['/requester/requests']);
    } else {
      this.router.navigate(['/requester/dashboard']);
    }
  }
}