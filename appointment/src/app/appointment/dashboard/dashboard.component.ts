import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NewReviewComponent } from '../reviews/new-review/new-review.component';
import { NewReferralComponent } from '../referrals/new-referral/new-referral.component';
import { Appointment } from '../appointment.model';
import { AppointmentService } from '../appointment.service';
import { AppService, AppointmentTypes } from '../../app.service';
import { ClinicService } from '../../settings/clinics/clinic.service';
import { Clinic } from '../../settings/clinics/clinic.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  review: Appointment[];
  fullLoadingSub = new Subscription();
  clinicsSub = new Subscription();

  clinics: Clinic[];
  loggedInDoctorClinic: string;
  isLoading = true;
  firstname: string;
  loggedInAlready = true;

  constructor(
    private dialogRef: MatDialog,
    private appointmentService: AppointmentService,
    private appService: AppService,
    private clinicService: ClinicService,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {

    // Set the title for the page
    this.appService.setPageTitle('Dashboard');

    this.clinicsSub = this.clinicService.clinics.subscribe(clinicsData => {
      this.clinics = clinicsData;
      this.isLoading = false;
    });

    this.firstname = JSON.parse(localStorage.getItem('userLoggedInData')).firstname;
    if (localStorage.getItem('_isLoggedInAlready') === '1') {
      this.loggedInAlready = false;
    }
    localStorage.setItem('_isLoggedInAlready', '1');

    this.loggedInDoctorClinic = this.authService.getUserClinic();
  }

  openAddNewReviewDialog() {
    const clns = [...this.clinics];
    const newReviewDialogRef = this.dialogRef.open(NewReviewComponent, {
      data: clns,
      // data: this.loggedInDoctorClinic,
      width: '500px',
      disableClose: true
    });

    newReviewDialogRef.afterClosed().subscribe(results => {
      if (!results) {
        return;
      }
      if (results !== 'cancel') {
        this.fullLoadingSub = this.appService.isProcessing.pipe(take(1)).subscribe(() => {
          this.appService._isProcessing.next(true);
        });
        this.appointmentService
          .addNewAppointment(
            results.patientName,
            results.clinic,
            results.appointmentDate,
            AppointmentTypes.review,
            results.appointmentTime
          ).subscribe(() => {
            this.appService._isProcessing.next(false);
            this.snackbar.open('Review added successfully', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
          });
      }
    });
  }

  openNewReferralDialog() {
    const clns = [...this.clinics];
    const newReferralDialogRef = this.dialogRef.open(NewReferralComponent, {
      data: clns,
      width: '500px',
      disableClose: true
    });

    newReferralDialogRef.afterClosed().subscribe(results => {
      if (results !== 'cancel') {
        this.fullLoadingSub = this.appService.isProcessing.pipe(take(1)).subscribe(() => {
          this.appService._isProcessing.next(true);
        });
        this.appointmentService.addNewAppointment(
          results.patientName,
          results.clinic,
          results.appointmentDate,
          AppointmentTypes.referral,
          '',
          results.referralReason
        ).subscribe(() => {
          this.appService._isProcessing.next(false);
          this.snackbar.open('Referral addedd successfully', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.fullLoadingSub) {
      this.fullLoadingSub.unsubscribe();
    }

    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }
  }
}
