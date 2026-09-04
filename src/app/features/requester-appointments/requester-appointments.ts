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
  bloodRequest?: any;
}

export interface BloodRequest {
  id?: number;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  city: string;
  urgency: string;
  status: string;
}

@Component({
  selector: 'app-requester-appointments',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './requester-appointments.html',
  styleUrls: ['./requester-appointments.css']
})
export class RequesterAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  bloodRequests: BloodRequest[] = [];
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:8080/api/appointments';
  private requestsUrl = 'http://localhost:8080/api/requests';

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
    console.log('RequesterAppointmentsComponent initialized');
    this.loadBloodRequests();
    
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

  loadBloodRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading requester blood requests from:', `${this.requestsUrl}/my-requests`);

    this.http.get<BloodRequest[]>(`${this.requestsUrl}/my-requests`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (requests) => {
        console.log('Requester blood requests loaded:', requests);
        this.bloodRequests = requests || [];
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Error loading requester blood requests:', err);
        this.bloodRequests = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAppointments(): void {
    console.log('Loading all appointments from:', `${this.baseUrl}/all`);

    this.http.get<Appointment[]>(`${this.baseUrl}/all`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (appointments) => {
        console.log('All appointments loaded:', appointments);
        
        // Filter appointments to show only those linked to requester's blood requests
        const myRequestIds = this.bloodRequests.map(req => req.id);
        this.appointments = (appointments || []).filter(apt => 
          apt.requestId && myRequestIds.includes(apt.requestId)
        );
        
        // Enrich appointments with blood request details
        this.appointments.forEach(apt => {
          if (apt.requestId) {
            apt.bloodRequest = this.bloodRequests.find(req => req.id === apt.requestId);
          }
        });

        console.log('Filtered appointments for requester:', this.appointments);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.appointments = [];
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

  goToAnalytics(): void {
    this.router.navigate(['/requester/analytics']);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  }
}
