import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAllReviewsItemComponent } from './edit-all-reviews-item.component';

describe('EditAllReviewsItemComponent', () => {
  let component: EditAllReviewsItemComponent;
  let fixture: ComponentFixture<EditAllReviewsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAllReviewsItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAllReviewsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
