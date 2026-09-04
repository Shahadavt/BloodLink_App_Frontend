import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-donation-history',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './donation-history.html',
  styleUrls: ['./donation-history.css']
})
export class DonationHistoryComponent implements OnInit {
  donations: any[] = [];
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  ngOnInit(): void {
    this.loadDonationHistory();
  }

  loadDonationHistory(): void {
    this.loading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    console.log('Donation history - Token exists:', !!token);
    console.log('Donation history - URL:', `${this.baseUrl}/donor/history`);

    this.http.get<any[]>(`${this.baseUrl}/donor/history`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (donations) => {
        console.log('Donation history response:', donations);
        this.donations = donations;
        this.loading = false;
        this.cdr.detectChanges();
        if (donations.length === 0) {
          this.snackBar.open('No donation history found', 'Close', { duration: 2000 });
        } else {
          this.snackBar.open(`Loaded ${donations.length} donation records`, 'Close', { duration: 2000 });
        }
      },
      error: (err) => {
        console.error('Error loading donation history:', err);
        this.errorMessage = 'Failed to load donation history. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load donation history', 'Close', { duration: 3000 });
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/donor/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/donor/dashboard']);
  }

  goToBrowseRequests(): void {
    this.router.navigate(['/requests']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'status-completed';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'OPEN':
      case 'PENDING':
        return 'status-pending';
      default:
        return 'status-default';
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
}
