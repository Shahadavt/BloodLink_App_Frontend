import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  requestId?: number;
}

export interface BloodRequest {
  id: number;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  city: string;
  urgency: string;
  status: string;
}

@Component({
  selector: 'app-donor-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './donor-scheduling.html',
  styleUrls: ['./donor-scheduling.css']
})
export class DonorSchedulingComponent implements OnInit {
  appointments: Appointment[] = [];
  bloodRequests: BloodRequest[] = [];
  loading = true;
  errorMessage = '';
  showBookingForm = false;
  
  newAppointment: Partial<Appointment> = {
    date: '',
    time: '',
    bloodCenter: '',
    status: 'SCHEDULED',
    requestId: undefined
  };

  selectedRequestId?: number;
  searchQuery: string = '';

  availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  bloodCenters = [
    'City General Hospital',
    'Regional Blood Bank',
    'Community Health Center',
    'University Medical Center'
  ];

  private baseUrl = 'http://localhost:8080/api/appointments';
  private requestsUrl = 'http://localhost:8080/api/requests';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  ngOnInit(): void {
    console.log('DonorSchedulingComponent initialized');
    this.loadBloodRequests();
    this.loadAppointments();
    
    // Fallback: ensure loading is set to false after 5 seconds
    setTimeout(() => {
      if (this.loading) {
        console.warn('Loading timeout - forcing loading to false');
        this.loading = false;
        this.errorMessage = 'Loading timeout. Please check your connection and try again.';
      }
    }, 5000);
  }

  loadBloodRequests(): void {
    console.log('Loading blood requests from:', `${this.requestsUrl}/all`);
    console.log('Headers:', this.getHeaders());

    this.http.get<BloodRequest[]>(`${this.requestsUrl}/all`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (requests) => {
        console.log('Blood requests loaded:', requests);
        console.log('Number of requests:', requests?.length);
        this.bloodRequests = requests.filter(r => r.status === 'OPEN' || r.status === 'PENDING') || [];
        console.log('Filtered blood requests:', this.bloodRequests);
        console.log('Number of filtered requests:', this.bloodRequests.length);
      },
      error: (err) => {
        console.error('Error loading blood requests:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.bloodRequests = [];
      }
    });
  }

  loadAppointments(): void {
    this.errorMessage = '';

    console.log('Loading appointments from:', `${this.baseUrl}/my-appointments`);

    this.http.get<Appointment[]>(`${this.baseUrl}/my-appointments`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (appointments) => {
        console.log('Appointments loaded:', appointments);
        this.appointments = appointments || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.appointments = [];
        this.errorMessage = 'Failed to load appointments. Backend server may not be running or appointments feature not yet available.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  bookAppointment(): void {
    if (!this.newAppointment.date || !this.newAppointment.time || !this.newAppointment.bloodCenter || !this.selectedRequestId) {
      this.snackBar.open('Please fill in all fields and select a blood request', 'Close', { duration: 3000 });
      return;
    }

    this.newAppointment.requestId = this.selectedRequestId;

    this.http.post<Appointment>(`${this.baseUrl}/book`, this.newAppointment, {
      headers: this.getHeaders()
    }).subscribe({
      next: (appointment) => {
        this.appointments.push(appointment);
        this.showBookingForm = false;
        this.newAppointment = { date: '', time: '', bloodCenter: '', status: 'SCHEDULED', requestId: undefined };
        this.selectedRequestId = undefined;
        this.cdr.detectChanges();
        this.snackBar.open('Appointment booked successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        this.snackBar.open('Failed to book appointment', 'Close', { duration: 3000 });
      }
    });
  }

  cancelAppointment(id: number): void {
    this.http.put<Appointment>(`${this.baseUrl}/${id}/cancel`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: (cancelledAppointment) => {
        const appointment = this.appointments.find(a => a.id === id);
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

  showBookingFormToggle(): void {
    this.showBookingForm = !this.showBookingForm;
    if (this.showBookingForm) {
      // Reset form when opening
      this.newAppointment = { date: '', time: '', bloodCenter: '', status: 'SCHEDULED', requestId: undefined };
      this.selectedRequestId = undefined;
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/donor/dashboard']);
  }

  goToHistory(): void {
    this.router.navigate(['/donor/donations']);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  get filteredBloodRequests(): BloodRequest[] {
    if (!this.searchQuery) {
      return this.bloodRequests;
    }
    
    const query = this.searchQuery.toLowerCase();
    return this.bloodRequests.filter(request => 
      request.patientName.toLowerCase().includes(query) ||
      request.bloodGroup.toLowerCase().includes(query) ||
      request.hospital.toLowerCase().includes(query) ||
      request.city.toLowerCase().includes(query) ||
      request.urgency.toLowerCase().includes(query)
    );
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency?.toUpperCase()) {
      case 'CRITICAL': return 'urgency-critical';
      case 'URGENT': return 'urgency-urgent';
      case 'NORMAL': return 'urgency-normal';
      default: return 'urgency-default';
    }
  }

  isRequestMatch(request: BloodRequest, query: string): boolean {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return request.patientName.toLowerCase().includes(lowerQuery) ||
           request.bloodGroup.toLowerCase().includes(lowerQuery) ||
           request.hospital.toLowerCase().includes(lowerQuery) ||
           request.city.toLowerCase().includes(lowerQuery) ||
           request.urgency.toLowerCase().includes(lowerQuery);
  }
}
