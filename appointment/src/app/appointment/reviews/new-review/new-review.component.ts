import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Clinic } from '../../../settings/clinics/clinic.model';
import { ClinicService } from '../../../settings/clinics/clinic.service';
import { AuthService } from '../../../auth/auth.service';

import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.component.html',
  styleUrls: ['./new-review.component.css']
})
export class NewReviewComponent implements OnInit {
  patientName: string;
  clinic: string;
  appointmentDate: Date;
  appointmentTime: string;
  userRole: string;

  clinics: Clinic[];

  constructor(
    private atpService: AmazingTimePickerService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: Clinic[]
  ) {}

  ngOnInit() {
    // this.clinic = this.data;
    this.clinics = [...this.data];

    this.clinic = this.authService.getUserClinic();
    this.userRole = this.authService.getRole();
  }

  openTime() {
    const timePicker = this.atpService.open({
      theme: 'material-blue'
    });

    timePicker.afterClose().subscribe(time => {
      this.appointmentTime = time;
    });
  }
}
