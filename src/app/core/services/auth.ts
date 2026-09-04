import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  bloodGroup: string;
  city: string;
  available: number;
  active: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  clearSession(): void {
    localStorage.removeItem('token');
  }

  decodeToken(token: string | null = this.getToken()): any {
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(normalized));
    } catch {
      return null;
    }
  }

  getUserRole(): string {
    const payload = this.decodeToken();
    const role = payload?.role || payload?.roles || 'DONOR';
    return role.toString().toUpperCase();
  }

  getUserName(): string {
    const payload = this.decodeToken();
    if (payload?.name) return payload.name;
    if (payload?.sub) return payload.sub.split('@')[0];
    return 'Care Partner';
  }

  getDashboardRoute(): string {
    const role = this.getUserRole();
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'REQUESTER') return '/requester/dashboard';
    return '/donor/dashboard';
  }
}