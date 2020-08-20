import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { User } from '../../users/user.model';
import { UserRoles } from '../../../app.service';
import { Clinic } from '../../clinics/clinic.model';
import { ClinicService } from '../../clinics/clinic.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  userId: string;
  fullname: string;
  username: string;
  password: string;
  role: string;
  clinic: string;
  userRoles = [UserRoles.doctor, UserRoles.editor, UserRoles['system admin']];
  clinics: Clinic[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: User, private clinicService: ClinicService) { }

  ngOnInit() {
    this.userId = this.data._id;
    this.fullname = this.data.fullname;
    this.username = this.data.username;
    this.role = this.data.role;
    this.clinic = this.data.clinic;
    this.clinicService.clinics.subscribe(clns => {
      this.clinics = [...clns];
    });
    this.password = this.data.password;
  }
}
