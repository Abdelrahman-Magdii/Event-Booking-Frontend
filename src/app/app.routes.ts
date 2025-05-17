import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {EventListComponent} from './events/event-list/event-list.component';
import {EventDetailsComponent} from './events/event-details/event-details.component';
import {BookingConfirmComponent} from './events/booking-confirm/booking-confirm.component';
import {AdminDashboardComponent} from './admin/admin-dashboard/admin-dashboard.component';
import {EventCreateEditComponent} from './admin/event-create-edit/event-create-edit.component';
import {AuthGuard} from './auth/auth.guard';
import {AdminGuard} from './auth/admin.guard';

export const routes: Routes = [

  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailsComponent },
  { path: 'booking-confirm/:id', component: BookingConfirmComponent, canActivate: [AuthGuard] },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'events/create', component: EventCreateEditComponent },
      { path: 'events/edit/:id', component: EventCreateEditComponent }
    ]
  },

  { path: '**', redirectTo: '/events' }
];

