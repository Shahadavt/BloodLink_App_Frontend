import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BloodService } from '../../core/services/blood';
import { AdminService } from '../../core/services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './request-list.html',
  styleUrls: ['./request-list.css']
})
export class RequestListComponent implements OnInit {
  // Observable stream that the HTML template will read directly
  requests$: Observable<any[]> = of([]);

  // Internal state management
  private refresh$ = new BehaviorSubject<void>(undefined);
  page: number = 0;
  size: number = 5;
  city: string = '';
  bloodGroup: string = '';
  loading: boolean = false;
  totalPages: number = 0;
  totalResults: number = 0;
  private cachedRequests: any[] = [];

  constructor(
    private bloodService: BloodService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Set up a declarative data pipeline
    this.requests$ = this.refresh$.pipe(
      tap(() => this.loading = true),
      switchMap(() => {
        const queryCity = this.city ? this.city.trim() : '';
        const queryGroup = this.bloodGroup || '';

        return this.bloodService.getPaged(this.page, this.size, queryCity, queryGroup).pipe(
          map((res: any) => {
            this.loading = false;
            if (res && res.content) {
              this.totalPages = res.totalPages || 0;
              this.totalResults = res.totalElements || res.content.length;
              this.cachedRequests = res.content;
              return res.content;
            } else if (Array.isArray(res)) {
              this.totalPages = 1;
              this.totalResults = res.length;
              this.cachedRequests = res;
              return res;
            }
            this.totalPages = 0;
            this.totalResults = 0;
            this.cachedRequests = [];
            return [];
          }),
          catchError((err) => {
            console.error('Search network stream broken:', err);
            this.loading = false;
            this.totalPages = 0;
            this.totalResults = 0;
            this.cachedRequests = [];
            return of([]);
          })
        );
      })
    );
  }

  fetchData(): void {
    // Emit a value to trigger the declarative pipeline automatically
    this.refresh$.next();
  }

  search(): void {
    this.page = 0; 
    this.fetchData();
  }

  resetFilters(): void {
    this.city = '';
    this.bloodGroup = '';
    this.page = 0;
    this.fetchData(); 
  }

  next(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.fetchData();
    }
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchData();
    }
  }

  // --- Actions ---
  accept(id: number): void {
    this.bloodService.acceptRequest(id).subscribe({
      next: () => this.fetchData(),
      error: () => this.snackBar.open('Error accepting request', 'Close', { duration: 3000 })
    });
  }

  close(id: number): void {
    const role = this.getRole();
    console.log('Closing request ID:', id, 'Role:', role);

    // Check permissions
    if (role !== 'ADMIN' && role !== 'DONOR') {
      this.snackBar.open('You do not have permission to close requests', 'Close', { duration: 3000 });
      return;
    }

    this.bloodService.closeRequest(id).subscribe({
      next: (response) => {
        console.log('Request closed successfully. Response:', response);
        // Update the local cached request instead of reloading
        const requestIndex = this.cachedRequests.findIndex(r => r.id === id);
        if (requestIndex !== -1) {
          this.cachedRequests[requestIndex].status = 'CLOSED';
          this.cdr.detectChanges();
        }
        this.snackBar.open('Request closed successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error closing request:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        this.snackBar.open('Error closing request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  delete(id: number): void {
    const role = this.getRole();
    console.log('Deleting request ID:', id, 'Role:', role);
    console.log('Token exists:', !!localStorage.getItem('token'));

    // Check permissions
    if (role !== 'ADMIN' && role !== 'REQUESTER') {
      this.snackBar.open('You do not have permission to delete requests', 'Close', { duration: 3000 });
      return;
    }

    if (confirm('Are you sure you want to delete this request?')) {
      this.bloodService.deleteRequest(id).subscribe({
        next: (response) => {
          console.log('Request deleted successfully. Response:', response);
          // Remove the request from local cache instead of reloading
          this.cachedRequests = this.cachedRequests.filter(r => r.id !== id);
          this.totalResults = this.cachedRequests.length;
          this.cdr.detectChanges();
          this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting request:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error details:', err.error);
          this.snackBar.open('Error deleting request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role; 
    } catch (e) {
      return null;
    }
  }

  getBloodGroupClass(bloodGroup: string): string {
    const group = bloodGroup?.toUpperCase() || '';
    switch (group) {
      case 'A+': return 'badge-a-plus';
      case 'A-': return 'badge-a-minus';
      case 'B+': return 'badge-b-plus';
      case 'B-': return 'badge-b-minus';
      case 'AB+': return 'badge-ab-plus';
      case 'AB-': return 'badge-ab-minus';
      case 'O+': return 'badge-o-plus';
      case 'O-': return 'badge-o-minus';
      default: return 'badge-danger';
    }
  }

  getUrgencyClass(urgency: string): string {
    const level = urgency?.toUpperCase() || 'NORMAL';
    switch (level) {
      case 'CRITICAL': return 'urgency-critical';
      case 'URGENT': return 'urgency-urgent';
      case 'NORMAL': return 'urgency-normal';
      default: return 'urgency-normal';
    }
  }
}