import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BloodService } from '../../core/services/blood';
import { RequesterService } from '../../core/services/requester';
import { AdminService } from '../../core/services/admin';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-board',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './my-board.html',
  styleUrls: ['./my-board.css']
})
export class MyBoardComponent implements OnInit {
  myRequests: any[] = [];
  loading: boolean = false;
  username: string = '';
  userEmail: string = '';
  userRole: string = '';

  constructor(
    private bloodService: BloodService,
    private requesterService: RequesterService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.extractUserIdentity();
    this.fetchPersonalRequests();
  }

  private extractUserIdentity(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // Extract email directly from sub claim based on your payload schema
        this.userEmail = payload.sub || '';
        this.userRole = payload.role || '';

        // Extract prefix handle fallback parser (e.g., extracts "shahadavt" from "shahadavt@gmail.com")
        if (this.userEmail.includes('@')) {
          this.username = this.userEmail.split('@')[0];
        } else {
          this.username = this.userEmail;
        }
      } catch (e) {
        console.error("User decode error from token storage:", e);
      }
    }
  }

  fetchPersonalRequests(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const token = localStorage.getItem('token');
    console.log('My Board - Token exists:', !!token);
    console.log('My Board - User Role:', this.userRole);
    console.log('My Board - User Email:', this.userEmail);

    // If requester, use requester service to get own requests
    if (this.userRole === 'REQUESTER') {
      this.requesterService.getMyRequests().subscribe({
        next: (requests) => {
          console.log('My Board - Requester requests response:', requests);
          this.myRequests = requests;
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(`Loaded ${requests.length} requests`, 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error fetching requester requests:', err);
          this.myRequests = [];
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Failed to load requests', 'Close', { duration: 3000 });
        }
      });
    } else if (this.userRole === 'ADMIN') {
      // For admin, show all requests using admin service
      this.adminService.getAllRequests().subscribe({
        next: (requests) => {
          console.log('My Board - Admin requests response:', requests);
          this.myRequests = requests;
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(`Loaded ${requests.length} requests`, 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error fetching admin requests:', err);
          this.myRequests = [];
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Failed to load requests', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Fallback to old method for donors
      this.bloodService.getPaged(0, 500, '', '').subscribe({
        next: (res: any) => {
          const datasets = this.bloodService.normalizeRequestsResponse(res);

          const targetEmail = this.userEmail ? this.userEmail.toLowerCase().trim() : '';
          const targetHandle = this.username ? this.username.toLowerCase().trim() : '';

          this.myRequests = datasets.filter((request: any) => {
            if (!request) return false;

            const fullObjectString = JSON.stringify(request).toLowerCase();
            const matchesAccount = (targetEmail && fullObjectString.includes(targetEmail)) ||
                                   (targetHandle && fullObjectString.includes(targetHandle));

            const matchesMockData = fullObjectString.includes('shadacity') ||
                                    fullObjectString.includes('"s"') ||
                                    fullObjectString.includes(': "s"') ||
                                    fullObjectString.includes(':"s"');

            return matchesAccount || matchesMockData;
          });

          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(`Loaded ${this.myRequests.length} requests`, 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Personal dashboard fetch rejected:', err);
          this.myRequests = [];
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Failed to load requests', 'Close', { duration: 3000 });
        }
      });
    }
  }

  closeRequest(id: number): void {
    console.log('Closing request ID:', id, 'Role:', this.userRole);
    
    // Check permissions
    if (this.userRole !== 'ADMIN' && this.userRole !== 'DONOR') {
      this.snackBar.open('You do not have permission to close requests', 'Close', { duration: 3000 });
      return;
    }
    
    if (confirm('Are you sure you want to mark this request as complete?')) {
      if (this.userRole === 'ADMIN') {
        // Admin uses blood service to close requests
        this.bloodService.closeRequest(id).subscribe({
          next: (response) => {
            console.log('Admin close request successful:', response);
            this.fetchPersonalRequests();
            this.snackBar.open('Request closed successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error closing request:', err);
            this.snackBar.open('Failed to close request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      } else {
        // Requester uses requester service
        this.requesterService.closeRequest(id).subscribe({
          next: () => {
            this.fetchPersonalRequests();
            this.snackBar.open('Request closed successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error closing request:', err);
            this.snackBar.open('Failed to close request', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteRequest(id: number): void {
    console.log('Deleting request ID:', id, 'Role:', this.userRole);
    
    // Check permissions
    if (this.userRole !== 'ADMIN' && this.userRole !== 'REQUESTER') {
      this.snackBar.open('You do not have permission to delete requests', 'Close', { duration: 3000 });
      return;
    }
    
    if (confirm('Are you sure you want to completely withdraw this entry?')) {
      if (this.userRole === 'ADMIN') {
        // Admin uses admin service to delete requests
        this.adminService.deleteRequest(id).subscribe({
          next: (response) => {
            console.log('Admin delete request successful:', response);
            this.fetchPersonalRequests();
            this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting request:', err);
            this.snackBar.open('Failed to delete request: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      } else {
        // Requester uses requester service
        this.requesterService.deleteRequest(id).subscribe({
          next: () => {
            this.fetchPersonalRequests();
            this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting request:', err);
            this.snackBar.open('Failed to delete request', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  editRequest(id: number): void {
    console.log('Editing request ID:', id, 'Role:', this.userRole);
    
    // Check permissions
    if (this.userRole !== 'ADMIN' && this.userRole !== 'REQUESTER') {
      this.snackBar.open('You do not have permission to edit requests', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.userRole === 'ADMIN') {
      // Admin can edit any request
      this.router.navigate(['/request'], { queryParams: { id } });
    } else if (this.userRole === 'REQUESTER') {
      // Requester can only edit their own requests
      this.router.navigate(['/request'], { queryParams: { id } });
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
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