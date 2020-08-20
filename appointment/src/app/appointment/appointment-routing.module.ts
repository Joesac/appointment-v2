import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MyReviewsComponent } from './reviews/my-reviews/my-reviews.component';
import { DoctorsNewReviewsComponent } from './reviews/doctors-new-reviews/doctors-new-reviews.component';
import { MyReferralsComponent } from './referrals/my-referrals/my-referrals.component';
import { MyCreatedAppointmentsComponent } from './my-created-appointments/my-created-appointments.component';
import { DoctorsPagesGuard } from './doctors-pages.guard';
import { EditorGuard } from './editor.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
    // canActivate: [DoctorsPagesGuard]
  },
  {
    path: 'my-reviews',
    component: MyReviewsComponent,
    canActivate: [DoctorsPagesGuard]
  },
  {
    path: 'doctor-reviews',
    component: DoctorsNewReviewsComponent,
    canActivate: [EditorGuard]
  },
  {
    path: 'my-referrals',
    component: MyReferralsComponent,
    canActivate: [DoctorsPagesGuard]
  },
  {
    path: 'my-created-appointments',
    component: MyCreatedAppointmentsComponent,
    // canActivate: [DoctorsPagesGuard]
  },
  {
    path: '',
    redirectTo: '/appointment/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
