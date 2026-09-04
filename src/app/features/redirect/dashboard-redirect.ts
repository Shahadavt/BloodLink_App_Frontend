import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  template: '<div class="p-5 text-center">Redirecting…</div>'
})
export class DashboardRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.navigate([this.authService.getDashboardRoute()]);
  }
}
