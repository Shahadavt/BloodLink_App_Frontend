import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'DONOR';
  bloodGroup = '';
  city = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  // Blood groups matching your MySQL entity options
  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  validateForm(): boolean {
    if (!this.name || this.name.trim().length < 2) {
      this.errorMessage = 'Please enter a valid name (at least 2 characters)';
      return false;
    }
    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Please enter your email address';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    if (!this.password || this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return false;
    }
    if (!/[A-Z]/.test(this.password)) {
      this.errorMessage = 'Password must contain at least one uppercase letter';
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
      this.errorMessage = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
      return false;
    }
    if (!this.bloodGroup) {
      this.errorMessage = 'Please select a blood group';
      return false;
    }
    if (!this.city || this.city.trim().length < 2) {
      this.errorMessage = 'Please enter a valid city (at least 2 characters)';
      return false;
    }
    return true;
  }

  onRegister() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      bloodGroup: this.bloodGroup,
      city: this.city,
      available: this.role === 'DONOR' ? 1 : 0,
      active: 1
    };

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.errorMessage = '';
        this.successMessage = 'Registration successful! Redirecting to login workspace...';
        this.isSubmitting = false;
        this.snackBar.open('Registration successful', 'Close', { duration: 2000 });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2200);
      },
      error: (err: any) => {
        console.error("Database persistence failure:", err);
        this.errorMessage = err?.error?.message || 'Registration failed. Check backend endpoint validation.';
        this.isSubmitting = false;
        this.snackBar.open('Registration failed', 'Close', { duration: 3000 });
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}