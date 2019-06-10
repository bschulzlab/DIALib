import { TestBed, inject } from '@angular/core/testing';

import { SwathResultService } from './swath-result.service';

describe('SwathResultService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwathResultService]
    });
  });

  it('should be created', inject([SwathResultService], (service: SwathResultService) => {
    expect(service).toBeTruthy();
  }));
});
