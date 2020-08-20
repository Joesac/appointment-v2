import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AddNewUserComponent } from './add-new-user/add-new-user.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { UsersService } from '../users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotAuthorizedComponent } from '../../not-authorized/not-authorized.component';
import { AuthService } from '../../auth/auth.service';
import { Clinic } from '../clinics/clinic.model';
import { ClinicService } from '../clinics/clinic.service';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserRoles } from '../../app.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  private usersSub = new Subscription();
  private clinicsSub = new Subscription();
  isLoading = false;

  displayedColumns: string[] = [
    'fullname',
    'username',
    'password',
    'date-added',
    'role'
  ];
  dataSource = [];
  clinics: Clinic[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private clinicService: ClinicService,
    private dialog: MatDialog,
    private usersService: UsersService,
    private router: Router,
    private authService: AuthService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.usersService.fetchUsers().subscribe(
      res => {
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

    this.usersSub = this.usersService.users.subscribe(users => {
      this.dataSource = users;
    });

    this.clinicsSub = this.clinicService
      .fetchClinics()
      .subscribe(clinicsData => {
        this.clinics = clinicsData;
      });
  }

  applyFilter(filterValue: string) {
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddNewUserDialog() {
    const clns = [...this.clinics];
    const newUserDialogRef = this.dialog.open(AddNewUserComponent, {
      data: clns,
      width: '600px',
      disableClose: true
    });

    newUserDialogRef.afterClosed().subscribe(results => {
      if (!results) {
        return;
      }

      this.isLoading = true;

      // Add the new user
      this.usersService
        .addNewUser(
          results.us,
          results.ps,
          results.fn,
          results.role,
          results.clinic
        )
        .subscribe(res => {
          this.isLoading = false;
        });
    });
  }

  getClickedRow(row) {}

  onEditUser(user: {}) {
    const editDialog = this.dialog.open(EditUserComponent, {
      data: user,
      disableClose: true
    });

    editDialog.afterClosed().subscribe(dialogRes => {
      if (dialogRes !== 'cancel') {

        // if Role was doctor with clinic and now changed to System admin or Editor
        if (dialogRes.role === UserRoles['system admin'] || dialogRes.role === UserRoles.editor) {
          dialogRes.clinic = null;
        }

        // Keep existing password if no password is entered
        let password = dialogRes.newPassword;
        if (password === '') {
          password = dialogRes.existingPassword;
        }

        this.usersService
          .editUser(
            dialogRes.userId,
            dialogRes.username,
            password,
            dialogRes.fullname,
            dialogRes.role,
            dialogRes.clinic
          )
          .subscribe(resp => {
            this.snackbar.open('User updated Successfully', '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000
            });
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }

    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }
  }
}
