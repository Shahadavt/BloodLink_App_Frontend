import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService, User } from '../../core/services/admin';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  errorMessage = '';
  displayedColumns: string[] = ['name', 'email', 'role', 'bloodGroup', 'city', 'available', 'active', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    console.log('Admin Users - Token exists:', !!token);
    console.log('Admin Users - Loading users...');

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Admin Users - Response:', users);
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(`Loaded ${users.length} users`, 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  toggleAvailability(user: User): void {
    console.log('Toggling availability for user:', user.id, user.name);
    this.adminService.toggleDonorAvailability(user.id).subscribe({
      next: (updatedUser) => {
        console.log('Availability updated successfully:', updatedUser);
        // Update the local user object instead of reloading
        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1 && updatedUser) {
          this.users[userIndex].available = updatedUser.available;
          this.cdr.detectChanges();
        }
        this.snackBar.open('Donor availability updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error toggling availability:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        this.snackBar.open('Failed to update donor availability: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  toggleActive(user: User): void {
    console.log('Toggling active status for user:', user.id, user.name);
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (updatedUser) => {
        console.log('Active status updated successfully:', updatedUser);
        // Update the local user object instead of reloading
        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1 && updatedUser) {
          this.users[userIndex].active = updatedUser.active;
          this.cdr.detectChanges();
        }
        this.snackBar.open('User status updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error toggling active status:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        this.snackBar.open('Failed to update user status: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      console.log('Deleting user:', user.id, user.name);
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.users = this.users.filter(u => u.id !== user.id);
          this.cdr.detectChanges();
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error details:', err.error);
          this.snackBar.open('Failed to delete user: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'DONOR': return 'role-donor';
      case 'REQUESTER': return 'role-requester';
      default: return 'role-default';
    }
  }

  getStatusBadgeClass(status: boolean): string {
    return status ? 'status-active' : 'status-inactive';
  }
}
