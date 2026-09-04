import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { MatIconModule } from '@angular/material/icon';
import { ToastComponent } from '../ui/toast/toast.component';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, ToastComponent, ConfirmDialogComponent],
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.css']
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', roles: ['ADMIN'] },
    { label: 'Requests', route: '/admin/requests', icon: 'bloodtype', roles: ['ADMIN'] },
    { label: 'Users', route: '/admin/users', icon: 'people', roles: ['ADMIN'] },
    { label: 'Appointments', route: '/admin/appointments', icon: 'event', roles: ['ADMIN'] },
    { label: 'My Board', route: '/admin/my-board', icon: 'view_list', roles: ['ADMIN'] },
    { label: 'Analytics', route: '/admin/analytics', icon: 'bar_chart', roles: ['ADMIN'] },
    { label: 'Dashboard', route: '/donor/dashboard', icon: 'dashboard', roles: ['DONOR'] },
    { label: 'Browse Requests', route: '/donor/requests', icon: 'search', roles: ['DONOR'] },
    { label: 'My Donations', route: '/donor/donations', icon: 'volunteer_activism', roles: ['DONOR'] },
    { label: 'Schedule Donation', route: '/donor/scheduling', icon: 'event', roles: ['DONOR'] },
    { label: 'My Profile', route: '/donor/profile', icon: 'person', roles: ['DONOR'] },
    { label: 'Dashboard', route: '/requester/dashboard', icon: 'dashboard', roles: ['REQUESTER'] },
    { label: 'Create Request', route: '/requester/create', icon: 'add_circle', roles: ['REQUESTER'] },
    { label: 'My Requests', route: '/requester/requests', icon: 'list_alt', roles: ['REQUESTER'] },
    { label: 'Appointments', route: '/requester/appointments', icon: 'event', roles: ['REQUESTER'] },
    { label: 'Analytics', route: '/requester/analytics', icon: 'bar_chart', roles: ['REQUESTER'] },
    { label: 'My Profile', route: '/requester/profile', icon: 'person', roles: ['REQUESTER'] }
  ];

  get userName(): string {
    return this.authService.getUserName();
  }

  get userRole(): string {
    return this.authService.getUserRole();
  }

  get visibleNavItems(): any[] {
    const role = this.userRole;
    return this.navItems.filter(item => item.roles.includes(role));
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
