import { TestBed, inject } from '@angular/core/testing';

import { FileHandlerService } from './file-handler.service';

describe('FileHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileHandlerService]
    });
  });

  it('should be created', inject([FileHandlerService], (service: FileHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
