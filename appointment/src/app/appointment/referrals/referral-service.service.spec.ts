import { TestBed } from '@angular/core/testing';

import { ReferralServiceService } from './referral-service.service';

describe('ReferralServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReferralServiceService = TestBed.get(ReferralServiceService);
    expect(service).toBeTruthy();
  });
});
