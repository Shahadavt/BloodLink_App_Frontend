import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalyticsComponent implements OnInit {
  bloodDemandData: any = {};
  geographicData: any = {};
  fulfillmentData: any = {};
  trendsData: any = {};
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:8080/api/admin';

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
    console.log('AdminAnalyticsComponent initialized');
    this.loadAnalytics();
    
    // Fallback: ensure loading is set to false after 10 seconds
    setTimeout(() => {
      if (this.loading) {
        console.warn('Loading timeout - forcing loading to false');
        this.loading = false;
        this.errorMessage = 'Loading timeout. Please check your connection and try again.';
        this.cdr.detectChanges();
      }
    }, 10000);
  }

  loadAnalytics(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading admin analytics from:', `${this.baseUrl}/analytics/blood-demand`);

    this.http.get<any>(`${this.baseUrl}/analytics/blood-demand`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Blood demand analytics loaded:', data);
        this.bloodDemandData = data || {};
        this.loadGeographicAnalytics();
      },
      error: (err) => {
        console.error('Error loading blood demand analytics:', err);
        this.errorMessage = 'Failed to load analytics data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadGeographicAnalytics(): void {
    console.log('Loading geographic analytics from:', `${this.baseUrl}/analytics/geographic`);
    
    this.http.get<any>(`${this.baseUrl}/analytics/geographic`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Geographic analytics loaded:', data);
        this.geographicData = data || {};
        this.loadFulfillmentAnalytics();
      },
      error: (err) => {
        console.error('Error loading geographic analytics:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFulfillmentAnalytics(): void {
    console.log('Loading fulfillment analytics from:', `${this.baseUrl}/analytics/fulfillment`);
    
    this.http.get<any>(`${this.baseUrl}/analytics/fulfillment`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Fulfillment analytics loaded:', data);
        this.fulfillmentData = data || {};
        this.loadTrendsAnalytics();
      },
      error: (err) => {
        console.error('Error loading fulfillment analytics:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTrendsAnalytics(): void {
    console.log('Loading trends analytics from:', `${this.baseUrl}/analytics/trends`);
    
    this.http.get<any>(`${this.baseUrl}/analytics/trends`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Trends analytics loaded:', data);
        this.trendsData = data || {};
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading trends analytics:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  getTotalCityRequests(): number {
    if (!this.geographicData.cityDistribution) return 0;
    return Object.values(this.geographicData.cityDistribution).reduce((sum: number, val: any) => sum + val, 0);
  }

  getTotalStatusRequests(): number {
    if (!this.trendsData.statusTrends) return 0;
    return Object.values(this.trendsData.statusTrends).reduce((sum: number, val: any) => sum + val, 0);
  }

  toLowerCase(value: any): string {
    return String(value).toLowerCase();
  }
}
