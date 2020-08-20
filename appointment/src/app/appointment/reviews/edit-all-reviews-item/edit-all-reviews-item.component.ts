import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Clinic } from '../../../settings/clinics/clinic.model';
import { Insurance } from '../../../settings/insurances/insurance.model';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { Appointment } from '../../appointment.model';

interface DialogData {
  appointment: Appointment;
  clns: Clinic[];
  insns: Insurance[];
}

@Component({
  selector: 'app-edit-all-reviews-item',
  templateUrl: './edit-all-reviews-item.component.html',
  styleUrls: ['./edit-all-reviews-item.component.css']
})
export class EditAllReviewsItemComponent implements OnInit, OnDestroy {
  patientName: string;
  clinic: string;
  insurance: string;
  appointmentTime: string;
  appointmentDate: Date;
  reviewId: string;
  contact: string;
  response: string;
  remarks: string;
  appointmentType: string;
  madeBy: string;

  clinicsSub = new Subscription();
  insuranceSub = new Subscription();

  clinics: Clinic[];
  insurances: Insurance[];

  constructor(
    private atpService: AmazingTimePickerService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit() {
    this.patientName = this.data.appointment.name;
    this.insurance = this.data.appointment.insurance;
    this.clinic = this.data.appointment.clinic;
    this.appointmentDate = this.data.appointment.bookedDate;
    this.appointmentTime = this.data.appointment.time;
    this.reviewId = this.data.appointment._id;
    this.contact = this.data.appointment.contact;
    this.response = this.data.appointment.response;
    this.remarks = this.data.appointment.remarks;
    this.madeBy = this.data.appointment.madeBy;
    this.clinics = [...this.data.clns];
    this.insurances = [...this.data.insns];
  }

  openTime() {
    const timePicker = this.atpService.open({
      theme: 'material-blue'
    });

    timePicker.afterClose().subscribe(time => {
      this.appointmentTime = time;
    });
  }

  ngOnDestroy() {
    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }

    if (this.insuranceSub) {
      this.insuranceSub.unsubscribe();
    }
  }
}
