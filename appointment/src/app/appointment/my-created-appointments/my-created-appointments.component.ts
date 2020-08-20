import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Subscription, Subject, Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { EditMyAppointmentComponent } from '../reviews/edit-my-appointment/edit-my-appointment.component';
import { ConfirmReviewCancelComponent } from '../reviews/confirm-review-cancel/confirm-review-cancel.component';
import { NotAuthorizedComponent } from '../../not-authorized/not-authorized.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Appointment } from '../appointment.model';
import { AppointmentService } from '../appointment.service';
import { AuthService } from '../../../app/auth/auth.service';
import { AppService, AppointmentTypes } from '../../app.service';
import { ClinicService } from 'src/app/settings/clinics/clinic.service';
import { Clinic } from 'src/app/settings/clinics/clinic.model';

@Component({
  selector: 'app-my-created-appointments',
  templateUrl: './my-created-appointments.component.html',
  styleUrls: ['./my-created-appointments.component.css']
})
export class MyCreatedAppointmentsComponent implements OnInit, OnDestroy {
  reviewDisplayedColumns: string[] = [
    'name',
    'insurance',
    'clinic',
    'time',
    'booked date',
    'contact',
  ];

  referralDisplayedColumns: string[] = [
    'name',
    'insurance',
    'clinic',
    'time',
    'booked date',
    'contact',
    'reason'
  ];

  // initialServerRequests = 1;
  private myCreatedReviewsSub: Subscription;
  private myCreatedReferralsSub: Subscription;
  myCreatedReviewsDataSource = new MatTableDataSource<Appointment>([]);
  myCreatedReferralsDataSource = new MatTableDataSource<Appointment>([]);
  data;
  userId: string;
  fullname: string;
  insurance: string;
  appointmentDate: Date;
  appointmentTime: string;
  fullLoadingSub = new Subscription();
  selection = new SelectionModel<Appointment>(true, []);
  appointmentType = AppointmentTypes.review;
  clinicsSub = new Subscription();
  clinics: Clinic[];
  role: string;
  loadingMyCreatedReviews = true;
  loadingMyCreatedReferrals = true;
  todaysDate: Date = new Date(new Date().getMonth() + 1 + '/' + new Date().getDate() + '/' + new Date().getFullYear());
  dateFrom: Date = this.todaysDate;
  dateTo: Date = this.todaysDate;
  dateBookedFor = this.todaysDate;
  bookingDateOnFrom = 'booked_on';

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private appService: AppService,
    private clinicService: ClinicService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit() {

    // Set the title for the page
    this.appService.setPageTitle('My Created Appointments');

    this.userId = this.authService.getUserId();
    this.fullname = this.authService.fullname;
    this.appointmentService
      .getMyCreatedAppointments(AppointmentTypes.review, this.dateFrom, this.dateTo)
      .subscribe(
        () => {
          this.loadingMyCreatedReviews = false;
        },
        err => {
          if (err) {
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
        }
      );

    this.myCreatedReviewsSub = this.appointmentService.myCreatedReviews.subscribe(
      reviews => {
        this.myCreatedReviewsDataSource.data = reviews;
      }
    );

    this.myCreatedReferralsSub = this.appointmentService.myCreatedReferrals.subscribe(
      referral => {
        this.myCreatedReferralsDataSource.data = referral;
      }
    );

    this.clinicsSub = this.clinicService.clinics.subscribe(clinicsData => {
      this.clinics = clinicsData;
    });
  }

  onStartDateChange() {
    if (this.dateFrom > this.dateTo) {
      this.dateTo = null;
    }
  }

  onDateToAndFromSelected() {
    return (this.dateFrom !== null && this.dateTo !== null) && (this.dateFrom <= this.dateTo);
  }

  onSearch(dateF: Date, dateT: Date) {
    this.loadingMyCreatedReviews = true;
    this.loadingMyCreatedReferrals = true;

    if (this.bookingDateOnFrom === 'booked_on') {
      this.appointmentService.getMyCreatedAppointments(AppointmentTypes.review, this.dateFrom, this.dateTo)
        .subscribe(() => this.loadingMyCreatedReviews = false);

      this.appointmentService.getMyCreatedAppointments(AppointmentTypes.referral, this.dateFrom, this.dateTo)
        .subscribe(() => this.loadingMyCreatedReferrals = false);
    } else {
      this.appointmentService.getMyCreatedAppointments(AppointmentTypes.review, this.dateBookedFor, null)
      .subscribe(() => this.loadingMyCreatedReviews = false);

      this.appointmentService.getMyCreatedAppointments(AppointmentTypes.referral, this.dateBookedFor, null)
      .subscribe(() => this.loadingMyCreatedReferrals = false);
    }
  }

  changeAppointmentType(evt) {
    if (evt.index === 0) {
      this.appointmentType = AppointmentTypes.review;
    }
    if (evt.index === 1) {
      this.appointmentType = AppointmentTypes.referral;

      this.myCreatedReviewsSub = this.appointmentService.myCreatedReferrals
        .pipe(take(1))
        .subscribe(apts => {
          if (this.appointmentType === AppointmentTypes.review) {
            this.myCreatedReviewsDataSource.data = apts;
          } else {
            this.myCreatedReferralsDataSource.data = apts;
            if (this.loadingMyCreatedReferrals !== false) {
              this.appointmentService
                .getMyCreatedAppointments(this.appointmentType, this.dateFrom, this.dateTo)
                .pipe(take(1))
                .subscribe(
                  () => {
                    this.loadingMyCreatedReferrals = false;
                  },
                  err => {
                    if (err) {
                      if (err instanceof HttpErrorResponse) {
                        if (err.status === 401 || err.status === 403) {
                          const dialogRef = this.dialog.open(
                            NotAuthorizedComponent,
                            { disableClose: true }
                          );

                          dialogRef.afterClosed().subscribe(() => {
                            this.authService.logout();
                            this.router.navigateByUrl('/login');
                            return;
                          });
                        }
                      }
                    }
                  }
                );
            }
          }
        });
    }
  }

  // isAllSelected(dataSource: MatTableDataSource<Appointment>) {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = dataSource.data.length;
  //   return numSelected === numRows;
  // }

  // masterToggle(dataSource: MatTableDataSource<Appointment>) {
  //   this.isAllSelected(dataSource) ?
  //       this.selection.clear() :
  //       dataSource.data.forEach(row => this.selection.select(row));
  // }

  cancelAppointment(appointment: Appointment) {
    const confirmCancelDialogRef = this.dialog.open(
      ConfirmReviewCancelComponent,
      {
        data: appointment,
        disableClose: true
      }
    );

    confirmCancelDialogRef.afterClosed().subscribe(results => {
      if (results !== 'no') {
        this.fullLoadingSub = this.appService.isProcessing
          .pipe(take(1))
          .subscribe(() => {
            this.appService._isProcessing.next(true);
          });
        this.appointmentService
          .cancel(results.appointmentId, this.appointmentType, true)
          .subscribe(() => {
            this.appService._isProcessing.next(false);
            this.snackbar.open('Appointment cancelled', '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          });
      }
    });
  }

  editAppointment(appointment: Appointment) {
    const clns = [...this.clinics];
    const role = this.appService.role;
    appointment.appointmentType = this.appointmentType;
    const dialog = this.dialog.open(EditMyAppointmentComponent, {
      data: { appointment, clns, role },
      width: '450px',
      disableClose: true
    });

    dialog.afterClosed().subscribe(results => {
      if (results !== 'cancel') {
        if (results.patientName.trim() === '') {
          this.snackBar.open('All fields are required', '', {
            duration: 3000,
            horizontalPosition: 'center'
          });
          return;
        }

        this.fullLoadingSub = this.appService.isProcessing
          .pipe(take(1))
          .subscribe(() => {
            this.appService._isProcessing.next(true);
          });

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
            results.reason
          )
          .pipe(take(1))
          .subscribe(() => {
            this.appService._isProcessing.next(false);
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
    if (this.myCreatedReviewsSub) {
      this.myCreatedReviewsSub.unsubscribe();
    }

    if (this.myCreatedReferralsSub) {
      this.myCreatedReferralsSub.unsubscribe();
    }

    if (this.fullLoadingSub) {
      this.fullLoadingSub.unsubscribe();
    }

    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }
  }
}
