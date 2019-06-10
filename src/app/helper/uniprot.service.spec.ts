import { TestBed, inject } from '@angular/core/testing';

import { UniprotService } from './uniprot.service';


describe('UniprotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UniprotService]
    });
  });

  it('should be created', inject([UniprotService], (service: UniprotService) => {
    expect(service).toBeTruthy();
  }));
});
