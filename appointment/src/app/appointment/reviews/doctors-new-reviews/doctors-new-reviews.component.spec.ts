import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsNewReviewsComponent } from './doctors-new-reviews.component';

describe('DoctorsNewReviewsComponent', () => {
  let component: DoctorsNewReviewsComponent;
  let fixture: ComponentFixture<DoctorsNewReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorsNewReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorsNewReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
