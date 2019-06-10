import { TestBed, inject } from '@angular/core/testing';

import { NglycoService } from './nglyco.service';

describe('NglycoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NglycoService]
    });
  });

  it('should be created', inject([NglycoService], (service: NglycoService) => {
    expect(service).toBeTruthy();
  }));
});
