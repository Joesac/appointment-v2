import { Component, OnInit, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface AppointmentId {
  _id: string;
}

@Component({
  selector: 'app-confirm-review-cancel',
  templateUrl: './confirm-review-cancel.component.html',
  styleUrls: ['./confirm-review-cancel.component.css']
})
export class ConfirmReviewCancelComponent implements OnInit {

  appointmentId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppointmentId) { }

  ngOnInit() {
    this.appointmentId = this.data._id;
  }

}
