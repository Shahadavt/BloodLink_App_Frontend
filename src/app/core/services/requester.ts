import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RequesterStats {
  totalRequests: number;
  completedRequests: number;
  openRequests: number;
  recentRequests: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RequesterService {
  private baseUrl = 'http://localhost:8080/api/requests';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getMyRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-requests`, {
      headers: this.getHeaders()
    });
  }

  updateRequest(id: number, request: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  deleteRequest(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  closeRequest(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/close/${id}`, {}, {
      headers: this.getHeaders()
    });
  }

  getRequesterStats(): Observable<RequesterStats> {
    return this.http.get<RequesterStats>(`${this.baseUrl}/requester/stats`, {
      headers: this.getHeaders()
    });
  }
}
