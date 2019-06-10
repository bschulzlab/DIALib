import { TestBed, inject } from '@angular/core/testing';

import { SvgAnnotationService } from './svg-annotation.service';

describe('SvgAnnotationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SvgAnnotationService]
    });
  });

  it('should be created', inject([SvgAnnotationService], (service: SvgAnnotationService) => {
    expect(service).toBeTruthy();
  }));
});
