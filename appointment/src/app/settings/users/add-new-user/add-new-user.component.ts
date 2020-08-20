import { Component, OnInit, Inject } from '@angular/core';
import { Clinic } from '../../../settings/clinics/clinic.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Roles {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.css']
})
export class AddNewUserComponent implements OnInit {

  userRoles: Roles[] = [
    {value: 'doctor', viewValue: 'Doctor'},
    {value: 'system admin', viewValue: 'System Admin'},
    {value: 'editor', viewValue: 'Editor'}
  ];

  clinics: Clinic[] = [];

  fullname: string;
  username: string;
  password: string;
  role: string;
  clinic: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clinic[]) {}

  ngOnInit() {
    this.clinics = [...this.data];
  }
}
