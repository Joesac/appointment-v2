import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadingModalComponent } from './full-loading-modal.component';

describe('FullLoadingModalComponent', () => {
  let component: FullLoadingModalComponent;
  let fixture: ComponentFixture<FullLoadingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullLoadingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullLoadingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
