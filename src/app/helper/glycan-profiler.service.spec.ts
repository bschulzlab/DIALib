import { TestBed, inject } from '@angular/core/testing';

import { GlycanProfilerService } from './glycan-profiler.service';

describe('GlycanProfilerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlycanProfilerService]
    });
  });

  it('should be created', inject([GlycanProfilerService], (service: GlycanProfilerService) => {
    expect(service).toBeTruthy();
  }));
});
