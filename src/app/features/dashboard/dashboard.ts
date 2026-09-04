import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BloodService } from '../../core/services/blood';
import { AdminService } from '../../core/services/admin';
import { DonorService } from '../../core/services/donor';
import { RequesterService } from '../../core/services/requester';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface BloodGroupDatum {
  group: string;
  count: number;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  user: any = {};
  userRole = 'DONOR';
  userBloodGroup = '';
  loading = true;
  errorMessage = '';

  totalRequests = 0;
  openRequests = 0;
  fulfilledRequests = 0;
  matchingRequests = 0;
  activeDonorRequests = 0;

  // Admin-specific stats
  totalDonors = 0;
  totalRequesters = 0;
  pendingRequests = 0;
  availableDonors = 0;
  unavailableDonors = 0;

  bloodGroupData: BloodGroupDatum[] = [
    { group: 'A+', count: 0, color: '#1976d2', bgColor: '#e3f2fd' },
    { group: 'A-', count: 0, color: '#388e3c', bgColor: '#e8f5e9' },
    { group: 'B+', count: 0, color: '#f57c00', bgColor: '#fff3e0' },
    { group: 'B-', count: 0, color: '#c2185b', bgColor: '#fce4ec' },
    { group: 'O+', count: 0, color: '#d32f2f', bgColor: '#ffebee' },
    { group: 'O-', count: 0, color: '#fbc02d', bgColor: '#fff8e1' },
    { group: 'AB+', count: 0, color: '#7b1fa2', bgColor: '#f3e5f5' },
    { group: 'AB-', count: 0, color: '#00796b', bgColor: '#e0f2f1' }
  ];

  recentRequests: any[] = [];
  private dashboardRequests: any[] = [];

  constructor(
    private router: Router,
    private bloodService: BloodService,
    private adminService: AdminService,
    private donorService: DonorService,
    private requesterService: RequesterService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.decodeUser();
    this.fetchDashboard();
  }

  private decodeUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = this.decodeJwtPayload(token);
      this.user = payload || {};

      this.userRole = (this.user?.role || 'DONOR').toString().toUpperCase().trim();
      this.userBloodGroup = this.getBloodGroupFromPayload(this.user);

      if (!this.userBloodGroup) {
        this.loadUserProfileFromBackend();
      }
    } catch (error) {
      console.error('Unable to decode token', error);
    }
  }

  private decodeJwtPayload(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  private getBloodGroupFromPayload(payload: any): string {
    return (payload?.bloodGroup || payload?.blood_group || payload?.bloodGroupName || '').toString().trim();
  }

  private loadUserProfileFromBackend(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const endpoints = [
      'http://localhost:8080/api/users/me',
      'http://localhost:8080/api/users/profile'
    ];

    const tryNext = (index: number): void => {
      if (index >= endpoints.length) {
        console.warn('No user profile endpoint returned a usable profile.');
        if (this.dashboardRequests.length) {
          this.processRequestsData(this.dashboardRequests);
        }
        return;
      }

      this.http.get<any>(endpoints[index], { headers }).subscribe({
        next: (profile: any) => {
          const profilePayload = profile?.user || profile?.data || profile;
          const bloodGroup = this.getBloodGroupFromPayload(profilePayload);

          if (bloodGroup) {
            this.userBloodGroup = bloodGroup;
          }

          if (this.dashboardRequests.length) {
            this.processRequestsData(this.dashboardRequests);
          }

          this.cdr.detectChanges();
        },
        error: () => {
          tryNext(index + 1);
        }
      });
    };

    tryNext(0);
  }

  private fetchDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // If admin, use admin service for dashboard stats
    if (this.userRole === 'ADMIN') {
      this.adminService.getDashboardStats().subscribe({
        next: (stats: any) => {
          this.totalDonors = stats.totalDonors || 0;
          this.totalRequesters = stats.totalRequesters || 0;
          this.totalRequests = stats.totalRequests || 0;
          this.pendingRequests = stats.pendingRequests || 0;
          this.fulfilledRequests = stats.completedRequests || 0;
          this.availableDonors = stats.availableDonors || 0;
          this.unavailableDonors = stats.unavailableDonors || 0;

          // Process recent requests from admin stats
          if (stats.recentRequests && stats.recentRequests.length > 0) {
            this.dashboardRequests = stats.recentRequests;
            this.processRequestsData(stats.recentRequests);
          } else {
            // Fallback to blood service if no recent requests
            this.fetchBloodRequests();
          }
        },
        error: (err) => {
          console.error('Admin dashboard error:', err);
          // Fallback to regular blood service
          this.fetchBloodRequests();
        }
      });
    } else if (this.userRole === 'DONOR') {
      // Use donor service for donor-specific stats
      this.donorService.getDonorStats().subscribe({
        next: (stats: any) => {
          this.fulfilledRequests = stats.completedDonations || 0;
          this.matchingRequests = stats.totalDonations || 0;
          this.userBloodGroup = stats.bloodGroup || this.userBloodGroup;

          // Fetch matching blood requests
          this.fetchBloodRequests();
        },
        error: (err) => {
          console.error('Donor dashboard error:', err);
          // Fallback to regular blood service
          this.fetchBloodRequests();
        }
      });
    } else if (this.userRole === 'REQUESTER') {
      // Use requester service for requester-specific stats
      this.requesterService.getRequesterStats().subscribe({
        next: (stats: any) => {
          this.totalRequests = stats.totalRequests || 0;
          this.fulfilledRequests = stats.completedRequests || 0;
          this.openRequests = stats.openRequests || 0;

          // Process recent requests from requester stats
          if (stats.recentRequests && stats.recentRequests.length > 0) {
            this.dashboardRequests = stats.recentRequests;
            this.processRequestsData(stats.recentRequests);
          } else {
            // Fallback to blood service if no recent requests
            this.fetchBloodRequests();
          }
        },
        error: (err) => {
          console.error('Requester dashboard error:', err);
          // Fallback to regular blood service
          this.fetchBloodRequests();
        }
      });
    } else {
      this.fetchBloodRequests();
    }
  }

  private fetchBloodRequests(): void {
    this.bloodService.getPaged(0, 200, '', '').subscribe({
      next: (res: any) => {
        const requests = this.extractRequests(res);
        this.dashboardRequests = requests;
        this.processRequestsData(requests);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Unable to load dashboard.';
        this.cdr.detectChanges();
      }
    });
  }

  private extractRequests(response: any): any[] {
    return this.bloodService.normalizeRequestsResponse(response);
  }

  private loadAllRequestsFallback(): void {
    this.bloodService.getAllRequests().subscribe({
      next: (response: any) => {
        this.processRequestsData(this.extractRequests(response));
      },
      error: (err) => {
        console.error('Both collection routes failed:', err);
        this.errorMessage = 'Unable to load dashboard information right now.';
        this.loading = false;
      }
    });
  }

  private processRequestsData(requests: any[]): void {
    this.calculateMetrics(requests);
    this.buildBloodGroupChart(requests);
    this.loadRecentRequests(requests);
    this.loading = false;
    this.cdr.detectChanges();
  }

  private calculateMetrics(requests: any[]): void {
    this.totalRequests = requests.length;

    this.openRequests = requests.filter((request: any) => {
      const status = (request.status || '').toUpperCase();
      return status === 'OPEN' || status === 'PENDING';
    }).length;

    this.fulfilledRequests = requests.filter((request: any) => {
      const status = (request.status || '').toUpperCase();
      return status === 'COMPLETED' || status === 'FULFILLED' || status === 'ACCEPTED';
    }).length;

    const normalizedUserBloodGroup = this.userBloodGroup.toUpperCase();
    this.matchingRequests = requests.filter((request: any) => {
      const blood = (request.bloodGroup || request.blood_group || '').toUpperCase();
      return blood === normalizedUserBloodGroup;
    }).length;
  }

  private buildBloodGroupChart(requests: any[]): void {
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'A+': { color: '#1976d2', bgColor: '#e3f2fd' },
      'A-': { color: '#388e3c', bgColor: '#e8f5e9' },
      'B+': { color: '#f57c00', bgColor: '#fff3e0' },
      'B-': { color: '#c2185b', bgColor: '#fce4ec' },
      'O+': { color: '#d32f2f', bgColor: '#ffebee' },
      'O-': { color: '#fbc02d', bgColor: '#fff8e1' },
      'AB+': { color: '#7b1fa2', bgColor: '#f3e5f5' },
      'AB-': { color: '#00796b', bgColor: '#e0f2f1' }
    };

    const countMap: Record<string, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
    };

    requests.forEach((request: any) => {
      const group = (request.bloodGroup || request.blood_group || '').toString().toUpperCase().trim();
      if (countMap[group] !== undefined) {
        countMap[group]++;
      }
    });

    this.bloodGroupData = Object.keys(countMap).map(group => ({
      group,
      count: countMap[group],
      color: colorMap[group].color,
      bgColor: colorMap[group].bgColor
    }));
  }

  private loadRecentRequests(requests: any[]): void {
    this.recentRequests = requests
      .sort((a, b) => {
        const d1 = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const d2 = new Date(b.createdAt || b.updatedAt || 0).getTime();

        return d2 - d1;
      })
      .slice(0, 5)
      .map(r => ({
        patientName:
          r.patientName ||
          r.patient ||
          r.name ||
          'Unknown',

        hospital:
          r.hospitalName ||
          r.hospital ||
          r.facility ||
          'Unknown Hospital',

        city:
          r.city || '-',

        bloodGroup:
          r.bloodGroup ||
          r.blood_group ||
          '-',

        status:
          (r.status || 'OPEN').toUpperCase()
      }));
  }

  getCleanName(): string {
    if (this.user?.name) return this.user.name;
    if (this.user?.sub) return this.user.sub.split('@')[0];
    return 'Care Partner';
  }

  getBarWidth(count: number): number {
    const max = this.getMaxBloodCount();
    if (!count || max === 0) return 4;
    return Math.min(100, Math.max(4, (count / max) * 100));
  }

  getStats(): Array<{label: string; value: number; icon: string; accent: string; progress: number}> {
    const total = this.totalRequests || 1;
    if (this.userRole === 'ADMIN') {
      return [
        { label: 'Total donors', value: this.totalDonors, icon: 'people', accent: 'primary', progress: 100 },
        { label: 'Total requesters', value: this.totalRequesters, icon: 'person_add', accent: 'info', progress: 100 },
        { label: 'Total requests', value: this.totalRequests, icon: 'inventory_2', accent: 'primary', progress: 100 },
        { label: 'Pending requests', value: this.pendingRequests, icon: 'priority_high', accent: 'danger', progress: total ? (this.pendingRequests / total) * 100 : 0 },
        { label: 'Completed', value: this.fulfilledRequests, icon: 'check_circle', accent: 'success', progress: total ? (this.fulfilledRequests / total) * 100 : 0 },
        { label: 'Available donors', value: this.availableDonors, icon: 'volunteer_activism', accent: 'success', progress: this.totalDonors ? (this.availableDonors / this.totalDonors) * 100 : 0 },
        { label: 'Unavailable donors', value: this.unavailableDonors, icon: 'block', accent: 'warning', progress: this.totalDonors ? (this.unavailableDonors / this.totalDonors) * 100 : 0 }
      ];
    }

    if (this.userRole === 'DONOR') {
      return [
        { label: 'Matching', value: this.matchingRequests, icon: 'favorite', accent: 'primary', progress: total ? (this.matchingRequests / total) * 100 : 0 },
        { label: 'Nearby', value: this.openRequests, icon: 'location_on', accent: 'danger', progress: total ? (this.openRequests / total) * 100 : 0 },
        { label: 'Accepted', value: this.fulfilledRequests, icon: 'volunteer_activism', accent: 'success', progress: total ? (this.fulfilledRequests / total) * 100 : 0 },
        { label: 'History', value: this.recentRequests.length, icon: 'history', accent: 'info', progress: 100 }
      ];
    }

    return [
      { label: 'Active requests', value: this.openRequests, icon: 'assignment', accent: 'primary', progress: total ? (this.openRequests / total) * 100 : 0 },
      { label: 'Completed', value: this.fulfilledRequests, icon: 'done_all', accent: 'success', progress: total ? (this.fulfilledRequests / total) * 100 : 0 },
      { label: 'Pending', value: Math.max(0, this.openRequests - this.fulfilledRequests), icon: 'pending', accent: 'danger', progress: total ? (Math.max(0, this.openRequests - this.fulfilledRequests) / total) * 100 : 0 },
      { label: 'Accepted donors', value: this.recentRequests.length, icon: 'groups', accent: 'info', progress: 100 }
    ];
  }

  getMaxBloodCount(): number {
    if (!this.bloodGroupData.length) return 1;
    return Math.max(...this.bloodGroupData.map(item => item.count));
  }

  goToRequest(): void { this.router.navigate(['/request']); }
  goToList(): void { this.router.navigate(['/requests']); }
  goToMyBoard(): void { this.router.navigate(['/my-board']); }
  goToUsers(): void { this.router.navigate(['/admin/users']); }
  goToProfile(): void { 
    if (this.userRole === 'DONOR') {
      this.router.navigate(['/donor/profile']);
    } else if (this.userRole === 'REQUESTER') {
      this.router.navigate(['/requester/profile']);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}