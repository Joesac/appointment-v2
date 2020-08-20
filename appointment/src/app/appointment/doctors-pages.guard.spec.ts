import { TestBed, async, inject } from '@angular/core/testing';

import { DoctorsPagesGuard } from './doctos-pages.guard';

describe('DoctorsPagesGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DoctorsPagesGuard]
    });
  });

  it('should ...', inject([DoctorsPagesGuard], (guard: DoctorsPagesGuard) => {
    expect(guard).toBeTruthy();
  }));
});
