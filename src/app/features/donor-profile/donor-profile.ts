import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  bloodGroup: string;
  city: string;
  available: boolean;
  active: boolean;
  password?: string;
}

@Component({
  selector: 'app-donor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './donor-profile.html',
  styleUrls: ['./donor-profile.css']
})
export class DonorProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  errorMessage = '';
  editing = false;
  editProfile: Partial<UserProfile> = {};

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
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(`${this.baseUrl}/profile`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (profile) => {
        console.log('Profile response:', profile);
        this.profile = profile;
        this.editProfile = { ...profile };
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Profile loaded successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      }
    });
  }

  startEditing(): void {
    this.editing = true;
    this.editProfile = { ...this.profile };
    console.log('Starting editing, editProfile.active:', this.editProfile.active);
  }

  cancelEditing(): void {
    this.editing = false;
    this.editProfile = { ...this.profile };
  }

  onActiveStatusChange(value: any): void {
    this.editProfile.active = value === 'true' || value === true;
  }

  onDropdownChange(event: any): void {
    // The [(ngModel)] binding handles the boolean value correctly
  }

  saveProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.put<any>(`${this.baseUrl}/profile`, this.editProfile, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedProfile: any) => {
        this.profile = updatedProfile;
        this.editing = false;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  toggleAvailability(): void {
    if (!this.profile) return;

    this.http.put<any>(`${this.baseUrl}/availability?available=${!this.profile.available}`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedProfile: any) => {
        this.profile = updatedProfile;
        this.cdr.detectChanges();
        this.snackBar.open('Availability updated successfully', 'Close', { duration: 3000 });
      },
      error: (err: any) => {
        console.error('Error updating availability:', err);
        this.snackBar.open('Failed to update availability', 'Close', { duration: 3000 });
      }
    });
  }

  goToHistory(): void {
    this.router.navigate(['/donor/donations']);
  }

  goToDashboard(): void {
    this.router.navigate(['/donor/dashboard']);
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
