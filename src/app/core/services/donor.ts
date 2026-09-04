import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DonorStats {
  totalDonations: number;
  completedDonations: number;
  available: boolean;
  bloodGroup: string;
  city: string;
  recentDonations: any[];
}

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

@Injectable({
  providedIn: 'root'
})
export class DonorService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/profile`, profile, {
      headers: this.getHeaders()
    });
  }

  updateAvailability(available: boolean): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/availability?available=${available}`, {}, {
      headers: this.getHeaders()
    });
  }

  getDonationHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/donor/history`, {
      headers: this.getHeaders()
    });
  }

  getDonorStats(): Observable<DonorStats> {
    return this.http.get<DonorStats>(`${this.baseUrl}/donor/stats`, {
      headers: this.getHeaders()
    });
  }
}
