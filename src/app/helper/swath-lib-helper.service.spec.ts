import { TestBed, inject } from '@angular/core/testing';

import { SwathLibHelperService } from './swath-lib-helper.service';

describe('SwathLibHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwathLibHelperService]
    });
  });

  it('should be created', inject([SwathLibHelperService], (service: SwathLibHelperService) => {
    expect(service).toBeTruthy();
  }));
});
