import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login.component';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { BloodRequestComponent } from './features/blood-request/blood-request';
import { RequestListComponent } from './features/request-list/request-list';
import { MyBoardComponent } from './features/my-board/my-board';
import { AppShellComponent } from './shared/shell/app-shell';
import { DashboardRedirectComponent } from './features/redirect/dashboard-redirect';
import { UnauthorizedComponent } from './features/errors/unauthorized/unauthorized';
import { UserManagementComponent } from './features/user-management/user-management';
import { DonorProfileComponent } from './features/donor-profile/donor-profile';
import { DonationHistoryComponent } from './features/donation-history/donation-history';
import { RequesterProfileComponent } from './features/requester-profile/requester-profile';
import { AdminAnalyticsComponent } from './features/admin-analytics/admin-analytics';
import { DonorSchedulingComponent } from './features/donor-scheduling/donor-scheduling';
import { RequesterAnalyticsComponent } from './features/requester-analytics/requester-analytics';
import { AdminAppointmentsComponent } from './features/admin-appointments/admin-appointments';
import { RequesterAppointmentsComponent } from './features/requester-appointments/requester-appointments';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardRedirectComponent },
      { path: 'admin/dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/requests', component: RequestListComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/users', component: UserManagementComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/my-board', component: MyBoardComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/analytics', component: AdminAnalyticsComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/appointments', component: AdminAppointmentsComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'donor/dashboard', component: DashboardComponent, canActivate: [roleGuard(['DONOR'])] },
      { path: 'donor/requests', component: RequestListComponent, canActivate: [roleGuard(['DONOR'])] },
      { path: 'donor/donations', component: DonationHistoryComponent, canActivate: [roleGuard(['DONOR'])] },
      { path: 'donor/profile', component: DonorProfileComponent, canActivate: [roleGuard(['DONOR'])] },
      { path: 'donor/scheduling', component: DonorSchedulingComponent, canActivate: [roleGuard(['DONOR'])] },
      { path: 'requester/dashboard', component: DashboardComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'requester/create', component: BloodRequestComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'requester/requests', component: MyBoardComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'requester/analytics', component: RequesterAnalyticsComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'requester/appointments', component: RequesterAppointmentsComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'requester/profile', component: RequesterProfileComponent, canActivate: [roleGuard(['REQUESTER'])] },
      { path: 'request', component: BloodRequestComponent, canActivate: [roleGuard(['ADMIN', 'REQUESTER'])] },
      { path: 'requests', component: RequestListComponent, canActivate: [roleGuard(['ADMIN', 'DONOR', 'REQUESTER'])] },
      { path: 'my-board', component: MyBoardComponent, canActivate: [roleGuard(['ADMIN', 'DONOR', 'REQUESTER'])] }
    ]
  },
  { path: '**', redirectTo: 'login' }
];