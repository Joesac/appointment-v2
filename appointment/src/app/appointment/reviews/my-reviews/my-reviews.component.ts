import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

import { take } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';

// Material
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { AppointmentService } from '../../appointment.service';
import { Appointment } from '../../appointment.model';
import { AuthService } from '../../../auth/auth.service';
import { EditMyAppointmentComponent } from '../edit-my-appointment/edit-my-appointment.component';
import { ConfirmReviewCancelComponent } from '../confirm-review-cancel/confirm-review-cancel.component';
import { NotAuthorizedComponent } from '../../../not-authorized/not-authorized.component';
import { AppService, AppointmentTypes } from '../../../app.service';

@Component({
  selector: 'app-my-reviews',
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'action',
    'name',
    'insurance',
    'clinic',
    'time',
    'booked date',
    'contact',
    // 'response',
    // 'remarks'
  ];
  isLoading = true;
  private myReviewsSub: Subscription;
  private userRowDetailsSub: Subscription;
  dataSource = new MatTableDataSource<Appointment>([]);
  data;
  userId: string;
  fullname: string;
  insurance: string;
  appointmentDate: Date;
  appointmentTime: string;
  fullLoadingSub = new Subscription();
  selection = new SelectionModel<Appointment>(true, []);
  appointmentType = AppointmentTypes.review;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private appService: AppService
  ) {}

  ngOnInit() {

    // Set the title for the page
    this.appService.setPageTitle('My Reviews');

    this.userId = this.authService.getUserId();
    this.fullname = this.authService.fullname;
    this.appointmentService.getMyAppointments('review').subscribe(() => {
      this.isLoading = false;
    }, err => {
      if (err) {
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
      }
    });

    this.myReviewsSub = this.appointmentService.reviews.subscribe(reviews => {
      this.dataSource.data = reviews;
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
    this.appointmentService.isDone(this.selection.selected, AppointmentTypes.review).subscribe(resData => {
      this.snackbar.open('Review(s) completed', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
    });
  }

  cancelReview(appointment: Appointment) {

    const confirmCancelDialogRef = this.dialog.open(ConfirmReviewCancelComponent, {
      data: appointment,
      disableClose: true
    });

    confirmCancelDialogRef.afterClosed().subscribe(results => {
      if (results !== 'no') {
        this.fullLoadingSub = this.appService.isProcessing.pipe(take(1)).subscribe(() => {
          this.appService._isProcessing.next(true);
        });
        this.appointmentService.cancel(results.reviewId, this.appointmentType, false).subscribe(() => {
          this.appService._isProcessing.next(false);
          this.snackbar.open('Review cancelled', '', {duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'});
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.myReviewsSub) {
      this.myReviewsSub.unsubscribe();
    }

    if (this.userRowDetailsSub) {
      this.userRowDetailsSub.unsubscribe();
    }

    if (this.fullLoadingSub) {
      this.fullLoadingSub.unsubscribe();
    }
  }
}
