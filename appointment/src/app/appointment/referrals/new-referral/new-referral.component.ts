import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Clinic } from '../../../settings/clinics/clinic.model';
import { ClinicService } from '../../../settings/clinics/clinic.service';

@Component({
  selector: 'app-new-referral',
  templateUrl: './new-referral.component.html',
  styleUrls: ['./new-referral.component.css']
})
export class NewReferralComponent implements OnInit {

  patientName: string;
  clinic: string;
  referralReason: string;

  clinics: Clinic[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clinic[]) { }

  ngOnInit() {
    this.clinics = [...this.data];
  }
}
