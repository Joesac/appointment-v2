import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take, tap, delay } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from './auth/auth.service';
import { AppService } from './app.service';
import { ClinicService } from './settings/clinics/clinic.service';
import { InsuranceService } from './settings/insurances/insurance.service';
import { EditPasswordComponent } from './settings/users/edit-password/edit-password.component';
import { UsersService } from './settings/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  username: string;
  userId: string;
  usernameSub = new Subscription();
  isARoleSub = new Subscription();
  fullLoadingSub = new Subscription();
  clinicSub = new Subscription();
  insuranceSub = new Subscription();
  pageTitleSubs = new Subscription();

  isProcessing: any;
  role: string;
  myClinic: string;

  isSystemAdmin = false;
  isEditor = false;
  isDoctor = false;

  currentPageTitle: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appService: AppService,
    private clinicService: ClinicService,
    private insuranceService: InsuranceService,
    private dialog: MatDialog,
    private userService: UsersService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit() {

    // Subscribe to the page titles
    this.pageTitleSubs = this.appService.pageTitle
    .pipe(delay(0))
    .subscribe(pageTitle => {
      this.currentPageTitle = pageTitle;
    });

    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }

    this.appService.isProcessing.subscribe(ip => (this.isProcessing = ip));
    const loggedInUserData = localStorage.getItem('userLoggedInData');

    if (loggedInUserData) {
      const parsedLogedInData = JSON.parse(loggedInUserData);
      this.username = parsedLogedInData.username;
    }

    this.clinicSub = this.authService._doctorClinic.subscribe(mClinic => this.myClinic = mClinic);

    this.usernameSub = this.authService.username.subscribe(us => {
      this.username = us;
    });

    this.isARoleSub = this.appService.isARole.subscribe(d => {
      this.isSystemAdmin = d.isSystemAdmin;
      this.isEditor = d.isEditor;
      this.isDoctor = d.isDoctor;
    });

    // Purposely for when the app reloads after when the user is already logged in
    if (localStorage.getItem('userLoggedInData')) {
      this.appService.role = this.authService.getRole();
      this.isSystemAdmin =
        this.appService.role.toLowerCase() === 'system admin';
      this.isEditor = this.appService.role.toLowerCase() === 'editor';
      this.isDoctor = this.appService.role.toLowerCase() === 'doctor';

      this.myClinic = this.authService.getUserClinic();
    }

    // This is called to initially fetch the clinics to store for use in all the other components
    // if the page is reloaded whiles the user is logged in
    this.clinicSub = this.clinicService.fetchClinics().subscribe();
    this.insuranceSub = this.insuranceService.fetchInsurances().subscribe();
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  onChangePassword() {
    const editPasswordDialog = this.dialog.open(EditPasswordComponent, {
      disableClose: false
    });

    editPasswordDialog.afterClosed().subscribe(ps => {
      if (ps) {
        this.fullLoadingSub = this.appService.isProcessing.pipe(take(1)).subscribe(() => {
          this.appService._isProcessing.next(true);
        });

        this.userService.changePassword(ps.existingPs, ps.newPs)
        .subscribe(updateRes => {
          let infoText;
          if (updateRes === null) {
            infoText = 'password not correct';
          } else {
            infoText = 'Password updated successfully';
          }

          this.appService._isProcessing.next(false);
          this.snackbar.open(infoText, '', {
            verticalPosition: 'top', horizontalPosition: 'end', duration: 4000
          });
        });
      }
    });
  }

  onLogout(matDrawer: MatDrawer) {
    matDrawer.close();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {

    if (this.insuranceSub) {
      this.insuranceSub.unsubscribe();
    }

    if (this.pageTitleSubs) {
      this.pageTitleSubs.unsubscribe();
    }

    if (this.usernameSub) {
      this.usernameSub.unsubscribe();
    }

    if (this.isARoleSub) {
      this.isARoleSub.unsubscribe();
    }

    if (this.fullLoadingSub) {
      this.fullLoadingSub.unsubscribe();
    }

    if (this.clinicSub) {
      this.clinicSub.unsubscribe();
    }
  }
}
