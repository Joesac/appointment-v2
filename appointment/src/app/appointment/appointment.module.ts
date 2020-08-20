import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule, } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';


// External Modules
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { NewReferralComponent } from './referrals/new-referral/new-referral.component';
import { NewReviewComponent } from './reviews/new-review/new-review.component';
import { MyReviewsComponent } from './reviews/my-reviews/my-reviews.component';
import { MyReferralsComponent } from './referrals/my-referrals/my-referrals.component';
import { SharedComponentsModule } from '../shared-components.module';
import { EditMyAppointmentComponent } from './reviews/edit-my-appointment/edit-my-appointment.component';
import { DoctorsNewReviewsComponent } from './reviews/doctors-new-reviews/doctors-new-reviews.component';
import { EditAllReviewsItemComponent } from './reviews/edit-all-reviews-item/edit-all-reviews-item.component';
import { ConfirmReviewCancelComponent } from './reviews/confirm-review-cancel/confirm-review-cancel.component';
import { ConfirmReferralCancelComponent } from './referrals/confirm-referral-cancel/confirm-referral-cancel.component';
import { MyCreatedAppointmentsComponent } from './my-created-appointments/my-created-appointments.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AppointmentComponent,
    ReviewsComponent,
    ReferralsComponent,
    NewReferralComponent,
    NewReviewComponent,
    MyReviewsComponent,
    MyReferralsComponent,
    EditMyAppointmentComponent,
    DoctorsNewReviewsComponent,
    EditAllReviewsItemComponent,
    ConfirmReviewCancelComponent,
    ConfirmReferralCancelComponent,
    MyCreatedAppointmentsComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    FormsModule,
    SharedComponentsModule,
    HttpClientModule,

    // Material
    MatButtonModule,
    MatBadgeModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,

    // External
    AmazingTimePickerModule
  ],
  entryComponents: [
    NewReviewComponent,
    NewReferralComponent,
    EditMyAppointmentComponent,
    EditAllReviewsItemComponent,
    ConfirmReviewCancelComponent,
    ConfirmReferralCancelComponent
  ]
})
export class AppointmentModule {}
