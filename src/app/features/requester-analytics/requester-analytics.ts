import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requester-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './requester-analytics.html',
  styleUrls: ['./requester-analytics.css']
})
export class RequesterAnalyticsComponent implements OnInit {
  requestData: any = {};
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:8080/api/requests';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  ngOnInit(): void {
    console.log('RequesterAnalyticsComponent initialized');
    this.loadRequesterAnalytics();
    
    // Fallback: ensure loading is set to false after 5 seconds
    setTimeout(() => {
      if (this.loading) {
        console.warn('Loading timeout - forcing loading to false');
        this.loading = false;
        this.errorMessage = 'Loading timeout. Please check your connection and try again.';
        this.cdr.detectChanges();
      }
    }, 5000);
  }

  loadRequesterAnalytics(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading requester analytics from:', `${this.baseUrl}/requester/stats`);

    this.http.get<any>(`${this.baseUrl}/requester/stats`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Requester analytics loaded:', data);
        this.requestData = data || {};
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading requester analytics:', err);
        this.requestData = {};
        this.errorMessage = 'Failed to load analytics data. Please ensure you have REQUESTER role and the backend is running.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/requester/dashboard']);
  }

  goToRequests(): void {
    this.router.navigate(['/requester/requests']);
  }

  goToCreate(): void {
    this.router.navigate(['/requester/create']);
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'status-open';
      case 'ACCEPTED': return 'status-accepted';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      case 'PENDING': return 'status-pending';
      default: return 'status-default';
    }
  }

  toString(value: any): string {
    return String(value);
  }

  toLowerCase(value: any): string {
    return String(value).toLowerCase();
  }
}
