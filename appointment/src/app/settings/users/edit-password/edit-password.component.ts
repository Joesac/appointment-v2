import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.css']
})
export class EditPasswordComponent implements OnInit {

  existingPassword: string;
  newPassword: string;
  changePasswordForm: FormGroup;


  constructor() { }

  ngOnInit() {
    this.changePasswordForm = new FormGroup({
      existingPassword: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      newPassword: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
  }
}
