import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

export interface Appointment {
  id?: number;
  date: string;
  time: string;
  bloodCenter: string;
  status: string;
  donor?: any;
  requestId?: number;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './admin-appointments.html',
  styleUrls: ['./admin-appointments.css']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:8080/api/appointments';

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
    console.log('AdminAppointmentsComponent initialized');
    this.loadAppointments();
    
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

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading admin appointments from:', `${this.baseUrl}/all`);

    this.http.get<Appointment[]>(`${this.baseUrl}/all`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (appointments) => {
        console.log('Admin appointments loaded:', appointments);
        this.appointments = appointments || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admin appointments:', err);
        this.appointments = [];
        // Don't show error message, just show empty state
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelAppointment(appointmentId: number): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.http.put<Appointment>(`${this.baseUrl}/admin/${appointmentId}/cancel`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: (cancelledAppointment) => {
        console.log('Appointment cancelled:', cancelledAppointment);
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment && cancelledAppointment) {
          appointment.status = cancelledAppointment.status;
          this.cdr.detectChanges();
        }
        this.snackBar.open('Appointment cancelled successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error cancelling appointment:', err);
        this.snackBar.open('Failed to cancel appointment', 'Close', { duration: 3000 });
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  goToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  toLowerCase(value: any): string {
    return String(value).toLowerCase();
  }
}
