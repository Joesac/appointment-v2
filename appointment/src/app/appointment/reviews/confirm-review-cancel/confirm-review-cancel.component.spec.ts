import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmReviewCancelComponent } from './confirm-review-cancel.component';

describe('ConfirmReviewCancelComponent', () => {
  let component: ConfirmReviewCancelComponent;
  let fixture: ComponentFixture<ConfirmReviewCancelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmReviewCancelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmReviewCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
