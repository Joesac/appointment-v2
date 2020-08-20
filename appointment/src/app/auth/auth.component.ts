import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from './auth.service';
import { AuthUserData } from './authUserData.model';
import { AppService } from '../app.service';
import { ClinicService } from '../settings/clinics/clinic.service';
import { InsuranceService } from '../settings/insurances/insurance.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  form: FormGroup;
  processing = false;

  constructor(
    private appService: AppService,
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private clinicService: ClinicService,
    private insuranceService: InsuranceService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/appointment');
    }

    this.form = new FormGroup({
      username: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
  }

  onLogin() {
    if (!this.form.valid) {
      return;
    }

    const username = this.form.controls.username.value;
    const password = this.form.controls.password.value;

    this.processing = true;
    this.authService.login(username, password).subscribe(resData => {
      if (resData === 'INVALID CREDENTIALS') {
        this.snackbar.open('Username or Password Incorrect', '', {
          duration: 4000
        });
      } else {
        const user = resData.user[0];
        const token = resData.token;
        const uld = {
          user: user._id,
          token: token,
          username: user.username,
          firstname: user.fullname.split(' ')[0],
          clinic: user.clinic,
          role: user.role
        };

        if (user) {
          localStorage.setItem('userLoggedInData', JSON.stringify(uld));
          localStorage.setItem('_isLoggedInAlready', '0');

          const parsedUserLoggedInData = JSON.parse(localStorage.getItem('userLoggedInData'));
          this.authService._username.next(parsedUserLoggedInData.username);

          // Logged in Doctor's clinic
          const doctorClinic = parsedUserLoggedInData.clinic;
          if (doctorClinic !== undefined) {
            this.authService._doctorClinic.next(doctorClinic);
          }

          this.appService.role = this.authService.getRole();
          this.appService.isSystemAdmin =
            this.appService.role.toLowerCase() === 'system admin';
          this.appService.isEditor =
            this.appService.role.toLowerCase() === 'editor';
          this.appService.isDoctor =
            this.appService.role.toLowerCase() === 'doctor';

          this.appService._isARole.next({
            isSystemAdmin:
              this.appService.role.toLowerCase() === 'system admin',
            isEditor: this.appService.role.toLowerCase() === 'editor',
            isDoctor: this.appService.role.toLowerCase() === 'doctor'
          });

          // if (this.appService.isEditor) {
          //   this.router.navigate(['/appointment/doctor-reviews']);
          //   return;
          // }

          this.router.navigate(['/appointment']);
        }
      }
      this.processing = false;
    });
  }
}
