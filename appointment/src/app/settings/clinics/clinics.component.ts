import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { ClinicService } from './clinic.service';
import { NotAuthorizedComponent } from '../../not-authorized/not-authorized.component';
import { AuthService } from '../../auth/auth.service';
import { Clinic } from './clinic.model';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css']
})
export class ClinicsComponent implements OnInit, OnDestroy {
  isLoading = false;
  clinic: string;
  clinicsSub = new Subscription();
  dataSource: Clinic[];
  displayedColumns = ['serial', 'name'];

  constructor(private clinicService: ClinicService, private dialog: MatDialog, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.isLoading = true;
    this.clinicService.fetchClinics().subscribe(res => {
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

    this.clinicsSub = this.clinicService.clinics.subscribe(clinics => {
      this.dataSource = clinics;
    });

  }

  addClinic(clinicName: string) {
    this.isLoading = true;
    this.clinicService.addNewClinic(clinicName).subscribe(res => {
      this.isLoading = false;
      this.clinic = '';
    });
  }

  ngOnDestroy() {
    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }
  }
}
