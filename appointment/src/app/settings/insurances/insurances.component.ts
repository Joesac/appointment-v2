import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { InsuranceService } from './insurance.service';
import { NotAuthorizedComponent } from '../../not-authorized/not-authorized.component';
import { AuthService } from '../../auth/auth.service';
import { Insurance } from './insurance.model';

@Component({
  selector: 'app-insurances',
  templateUrl: './insurances.component.html',
  styleUrls: ['./insurances.component.css']
})
export class InsurancesComponent implements OnInit, OnDestroy {
  insurance: string;
  isLoading = false;
  insuranceSub = new Subscription();
  dataSource: Insurance[];
  displayedColumns = ['serial', 'name'];

  constructor(
    private insuranceService: InsuranceService,
    private dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.insuranceService.fetchInsurances().subscribe(
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

    this.insuranceSub = this.insuranceService.insurances.subscribe(insurances => {
      this.dataSource = insurances;
    });
  }

  addInsurance(insuranceName: string) {
    this.isLoading = true;
    this.insuranceService.addNewInsurance(insuranceName).subscribe(res => {
      this.isLoading = false;
      this.insurance = '';
    });
  }

  ngOnDestroy() {
    if (this.insuranceSub) {
      this.insuranceSub.unsubscribe();
    }
  }
}
