import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  validateForm(): boolean {
    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Please enter your email address';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }
    return true;
  }

  onLogin() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const data = { email: this.email, password: this.password };

    this.authService.login(data).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.snackBar.open('Login successful', 'Close', { duration: 2000 });
        this.router.navigate([this.authService.getDashboardRoute()]);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Invalid email or password';
        this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }
}