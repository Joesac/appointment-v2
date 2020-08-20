import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmReferralCancelComponent } from './confirm-referral-cancel.component';

describe('ConfirmReferralCancelComponent', () => {
  let component: ConfirmReferralCancelComponent;
  let fixture: ComponentFixture<ConfirmReferralCancelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmReferralCancelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmReferralCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
