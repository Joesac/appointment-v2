import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Appointment } from '../../appointment.model';
import { Clinic } from '../../../settings/clinics/clinic.model';
import { AmazingTimePickerService } from 'amazing-time-picker';

export interface DialogData {
  appointment: Appointment;
  clns: Clinic[];
  role: string;
}

@Component({
  selector: 'app-edit-my-appointment',
  templateUrl: './edit-my-appointment.component.html',
  styleUrls: ['./edit-my-appointment.component.css']
})
export class EditMyAppointmentComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private atpService: AmazingTimePickerService
  ) {}

  patientName: string;
  clinic: string;
  insurance: string;
  reviewId: string;
  appointmentDate: Date;
  appointmentTime: string;
  contact: string;
  remarks: string;
  response: string;
  role: string;
  reason: string;
  appointmentType: string;

  clinics: Clinic[];

  clinicsSub = new Subscription();

  ngOnInit() {
    this.patientName = this.data.appointment.name;
    this.clinic = this.data.appointment.clinic;
    this.insurance = this.data.appointment.insurance;
    this.reviewId = this.data.appointment._id;
    this.appointmentDate = this.data.appointment.bookedDate;
    this.appointmentTime = this.data.appointment.time;
    this.contact = this.data.appointment.contact;
    this.remarks = this.data.appointment.remarks;
    this.response = this.data.appointment.response;
    this.reason = this.data.appointment.reason;
    this.clinics = [...this.data.clns];
    this.appointmentType = this.data.appointment.appointmentType;
    this.role = this.data.role;
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
  }
}
