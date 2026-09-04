import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-page">
      <div class="error-card">
        <div class="error-badge">403</div>
        <h1>Access denied</h1>
        <p>You do not have permission to view this section of the platform.</p>
        <a routerLink="/login" class="primary-btn">Return to sign in</a>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block;min-height:100vh}.error-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#f8fbff,#eef4ff)}.error-card{max-width:480px;text-align:center;padding:32px;border-radius:24px;background:white;box-shadow:0 20px 45px rgba(15,23,42,.08)}.error-badge{display:inline-flex;padding:10px 14px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-weight:800;margin-bottom:14px}.primary-btn{display:inline-block;margin-top:16px;padding:10px 16px;border-radius:999px;background:linear-gradient(135deg,#e11d48,#ef4444);color:white;text-decoration:none;font-weight:700}`
  ]
})
export class UnauthorizedComponent {}
