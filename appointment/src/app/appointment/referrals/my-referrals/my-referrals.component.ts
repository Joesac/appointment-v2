import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { AppointmentService } from '../../appointment.service';
import { AuthService } from '../../../auth/auth.service';
import { EditMyAppointmentComponent } from '../../reviews/edit-my-appointment/edit-my-appointment.component';
import { ConfirmReferralCancelComponent } from '../confirm-referral-cancel/confirm-referral-cancel.component';
import { NotAuthorizedComponent } from '../../../not-authorized/not-authorized.component';
import { AppService } from '../../../app.service';
import { Appointment } from '../../appointment.model';
import { AppointmentTypes } from '../../../app.service';

@Component({
  selector: 'app-my-referrals',
  templateUrl: './my-referrals.component.html',
  styleUrls: ['./my-referrals.component.css']
})
export class MyReferralsComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = [
    'action',
    'name',
    'insurance',
    'clinic',
    'time',
    'booked date',
    'contact',
    'reason'
  ];

  isLoading = true;
  private myReferralSub: Subscription;
  dataSource = new MatTableDataSource<Appointment>([]);
  data;
  userId: string;
  fullname: string;
  fullLoadingSub = new Subscription();

  selection = new SelectionModel<Appointment>(true, []);

  constructor(
    private activatedRoute: ActivatedRoute,
    private appointmentService: AppointmentService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private appService: AppService
  ) {}

  ngOnInit() {

    // Set the title for the page
    this.appService.setPageTitle('My Referrals');

    this.userId = this.authService.userId;
    this.fullname = this.authService.fullname;
    this.appointmentService.getMyAppointments(AppointmentTypes.referral).subscribe(() => {
      this.isLoading = false;
    }, err => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 || err.status === 403) {
          const dialogRef = this.dialog.open(NotAuthorizedComponent, {disableClose: true});

          dialogRef.afterClosed().subscribe(() => {
            this.authService.logout();
            this.router.navigateByUrl('/login');
            return;
          });
        }
      }
    });

    this.myReferralSub = this.appointmentService.referrals.subscribe(referrals => {
      this.dataSource.data = referrals;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  finishAppointment() {
    this.appointmentService.isDone(this.selection.selected, AppointmentTypes.referral).subscribe(resData => {
      this.snackbar.open('Referral(s) completed', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
    });
  }

  cancelReferral(appointment: Appointment) {
      const confirmCancelDialogRef = this.dialog.open(ConfirmReferralCancelComponent, {
        data: appointment, disableClose: true
      });

      confirmCancelDialogRef.afterClosed().subscribe(results => {
        if (results !== 'no') {
          this.fullLoadingSub = this.appService.isProcessing.pipe(take(1)).subscribe(() => {
            this.appService._isProcessing.next(true);
          });
          this.appointmentService.cancel(results.referralId, AppointmentTypes.referral, false).subscribe(() => {
            this.appService._isProcessing.next(false);
            this.snackbar.open('Referral cancelled', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
          });
        }
      });
  }

  ngOnDestroy() {
    if (this.myReferralSub) {
      this.myReferralSub.unsubscribe();
    }

    if (this.fullLoadingSub) {
      this.fullLoadingSub.unsubscribe();
    }
  }

}
