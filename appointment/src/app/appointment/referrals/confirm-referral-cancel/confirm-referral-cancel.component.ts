import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface ReferralId {
  _id: string;
}

@Component({
  selector: 'app-confirm-referral-cancel',
  templateUrl: './confirm-referral-cancel.component.html',
  styleUrls: ['./confirm-referral-cancel.component.css']
})
export class ConfirmReferralCancelComponent implements OnInit {

  referralId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ReferralId) { }

  ngOnInit() {
    this.referralId = this.data._id;
  }

}
