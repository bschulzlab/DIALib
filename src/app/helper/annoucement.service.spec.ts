import { TestBed, inject } from '@angular/core/testing';

import { AnnoucementService } from './annoucement.service';

describe('AnnoucementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnnoucementService]
    });
  });

  it('should be created', inject([AnnoucementService], (service: AnnoucementService) => {
    expect(service).toBeTruthy();
  }));
});
