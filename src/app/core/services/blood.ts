import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface BloodRequest {
  id?: number;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  city: string;
  unitsRequired: number;
  contactNumber: string;
  status?: string;
  urgency?: string;
}

@Injectable({ providedIn: 'root' })
export class BloodService {
  private baseUrl = 'http://localhost:8080/api/requests';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  normalizeRequestsResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const candidateKeys = ['content', 'data', 'items', 'requests'];

    for (const key of candidateKeys) {
      const candidate = response[key];
      if (Array.isArray(candidate)) {
        return candidate;
      }

      if (candidate && typeof candidate === 'object') {
        const nestedResult = this.normalizeRequestsResponse(candidate);
        if (nestedResult.length > 0) {
          return nestedResult;
        }
      }
    }

    return [];
  }

  private normalizePagedResponse(response: any): any {
    if (Array.isArray(response)) {
      return {
        content: response,
        totalElements: response.length,
        totalPages: 1
      };
    }

    if (!response || typeof response !== 'object') {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
      };
    }

    const normalized = { ...response };
    normalized.content = this.normalizeRequestsResponse(response);

    if (normalized.totalElements == null) {
      normalized.totalElements = normalized.content.length;
    }

    if (normalized.totalPages == null) {
      normalized.totalPages = normalized.content.length > 0 ? 1 : 0;
    }

    return normalized;
  }

  createRequest(data: BloodRequest): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getAllRequests(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() });
  }

  getPaged(page: number, size: number, city?: string, bloodGroup?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const cleanCity = city?.trim();
    const cleanBloodGroup = bloodGroup?.trim();

    if (cleanCity) {
      params = params.set('city', cleanCity);
    }

    if (cleanBloodGroup) {
      params = params.set('bloodGroup', cleanBloodGroup);
    }

    return this.http.get(`${this.baseUrl}/search`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      switchMap((response: any) => {
        const normalized = this.normalizePagedResponse(response);
        if (normalized.content.length > 0) {
          return of(normalized);
        }

        return this.getAllRequests().pipe(
          map((fallbackResponse: any) => this.normalizePagedResponse(fallbackResponse))
        );
      }),
      catchError(() => this.getAllRequests().pipe(
        map((fallbackResponse: any) => this.normalizePagedResponse(fallbackResponse))
      ))
    );
  }

  acceptRequest(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/accept/${id}`, {}, { headers: this.getHeaders() });
  }

  closeRequest(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/close/${id}`, {}, { 
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  updateRequest(id: number, request: BloodRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  getRequest(id: number): Observable<BloodRequest> {
    return this.http.get<BloodRequest>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}