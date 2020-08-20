import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCreatedAppointmentsComponent } from './my-created-appointments.component';

describe('MyCreatedAppointmentsComponent', () => {
  let component: MyCreatedAppointmentsComponent;
  let fixture: ComponentFixture<MyCreatedAppointmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCreatedAppointmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCreatedAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
