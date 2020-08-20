import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMyAppointmentComponent } from './edit-my-appointment.component';

describe('EditMyAppointmentComponent', () => {
  let component: EditMyAppointmentComponent;
  let fixture: ComponentFixture<EditMyAppointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMyAppointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMyAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
