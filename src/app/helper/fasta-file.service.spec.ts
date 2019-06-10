import { TestBed, inject } from '@angular/core/testing';

import { FastaFileService } from './fasta-file.service';

describe('FastaFileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FastaFileService]
    });
  });

  it('should be created', inject([FastaFileService], (service: FastaFileService) => {
    expect(service).toBeTruthy();
  }));
});
