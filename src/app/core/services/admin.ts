import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalDonors: number;
  totalRequesters: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  availableDonors: number;
  unavailableDonors: number;
  recentRequests: any[];
  recentUsers: any[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  bloodGroup: string;
  city: string;
  available: boolean;
  active: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  toggleDonorAvailability(id: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}/toggle-availability`, {}, {
      headers: this.getHeaders()
    });
  }

  toggleUserActive(id: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}/toggle-active`, {}, {
      headers: this.getHeaders()
    });
  }

  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/requests`, {
      headers: this.getHeaders()
    });
  }

  deleteRequest(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/requests/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  closeRequest(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/requests/${id}/close`, {}, {
      headers: this.getHeaders()
    });
  }
}
