import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppointmentService } from '../../appointment.service';
import { EditAllReviewsItemComponent } from '../edit-all-reviews-item/edit-all-reviews-item.component';
import { NotAuthorizedComponent } from '../../../not-authorized/not-authorized.component';
import { AuthService } from '../../../auth/auth.service';
import { AppointmentTypes, AppService } from '../../../app.service';
import { Appointment } from '../../appointment.model';
import { ClinicService } from '../../../settings/clinics/clinic.service';
import { InsuranceService } from '../../../settings/insurances/insurance.service';
import { Clinic } from '../../../settings/clinics/clinic.model';
import { Insurance } from '../../../settings/insurances/insurance.model';
import { NewReviewComponent } from '../new-review/new-review.component';

@Component({
  selector: 'app-doctors-new-reviews',
  templateUrl: './doctors-new-reviews.component.html',
  styleUrls: ['./doctors-new-reviews.component.css']
})
export class DoctorsNewReviewsComponent implements OnInit, OnDestroy {
  reviewDataSource = [];
  referralDataSource = [];
  displayedColumns: string[] = [
    'name',
    'insurance',
    'clinic',
    'time',
    'made by',
    'booked date',
    'contact',
    'response',
    'remarks',
    'editor'
  ];

  todaysDate: Date = new Date(new Date().getMonth() + 1 + '/' + new Date().getDate() + '/' + new Date().getFullYear());
  dateFrom: Date = this.todaysDate;
  dateTo: Date = this.todaysDate;
  dateBookedFor = this.todaysDate;

  isLoading = true;
  allReviewsSub = new Subscription();
  appointmentType = AppointmentTypes.review;
  clinicsSub = new Subscription();
  insurancesSub = new Subscription();
  bookingDateOnFrom = 'booked_on';
  clinics: Clinic[];
  insurances: Insurance[];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private clinicService: ClinicService,
    private insuranceService: InsuranceService,
    private appService: AppService
  ) {}

  ngOnInit() {

    // Set the title for the page
    this.appService.setPageTitle('Bookings');

    // this.clinicService.clinics.subscribe(clinicsData => {
    //   this.clinics = clinicsData;
    //   this.isLoading = false;
    // });

    this.clinicsSub = this.clinicService.clinics.subscribe(clinics => {
      this.clinics = clinics;
    });

    this.insurancesSub = this.insuranceService.insurances.subscribe(insurances => {
      this.insurances = insurances;
    });

    this.appointmentService.undoneReviews.subscribe(formattedReviewData => {
      this.reviewDataSource = formattedReviewData;
    });

    this.appointmentService.undoneReferrals.subscribe(formattedReferralData => {
      this.referralDataSource = formattedReferralData;
    });

    this.allReviewsSub = this.appointmentService
      .getUndoneAppointment(this.dateFrom, this.dateTo)
      .subscribe(
        () => {
          this.isLoading = false;
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              const dialogRef = this.dialog.open(NotAuthorizedComponent, {
                disableClose: true
              });

              dialogRef.afterClosed().subscribe(() => {
                this.authService.logout();
                this.router.navigateByUrl('/login');
                return;
              });
            }
          }
        }
      );
  }


  onStartDateChange() {
    if (this.dateFrom > this.dateTo) {
      this.dateTo = null;
    }
  }

  onDateToAndFromSelected() {
    return (this.dateFrom !== null && this.dateTo !== null) && (this.dateFrom <= this.dateTo);
  }

  search(dateFrom: Date, dateTo: Date) {
    this.isLoading = true;
    if (this.bookingDateOnFrom === 'booked_on') {
      this.appointmentService.getUndoneAppointment(dateFrom, dateTo).subscribe(() => (this.isLoading = false));
    } else {
      this.appointmentService.getUndoneAppointment(this.dateBookedFor, null).subscribe(() => (this.isLoading = false));
    }
  }

  changeAppointmentType(evt) {
    if (evt.index === 0) {
      this.appointmentType = AppointmentTypes.review;
    }
    if (evt.index === 1) {
      this.appointmentType = AppointmentTypes.referral;
    }
  }

  editAppointment(appointment: Appointment) {
    const clns = [...this.clinics];
    const insns = [...this.insurances];
    const dialog = this.dialog.open(EditAllReviewsItemComponent, {
      data: { appointment, clns, insns },
      width: '600px',
      disableClose: true
    });

    dialog.afterClosed().subscribe(results => {
      if (results !== 'cancel') {
        if (results.patientName.trim() === '') {
          this.snackbar.open('All review fields are required', '', {
            duration: 3000
          });
          return;
        }
        
        this.appointmentService
          .updateAppointment(
            results._id,
            results.patientName.trim(),
            results.clinic.trim(),
            this.appointmentType,
            results.insurance,
            results.appointmentDate,
            results.appointmentTime,
            results.contact,
            results.remarks,
            results.response,
            results.reason,
            AppointmentTypes.general,
            this.authService.getUsernameString(),
            results.madeBy
          )
          .subscribe(() => {
            this.snackbar.open('Appointment updated successfully', '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.allReviewsSub) {
      this.allReviewsSub.unsubscribe();
    }

    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }

    if (this.insurancesSub) {
      this.insurancesSub.unsubscribe();
    }
  }
}
