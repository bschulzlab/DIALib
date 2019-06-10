import { TestBed, inject } from '@angular/core/testing';

import { SwathLibAssetService } from './swath-lib-asset.service';

describe('SwathLibAssetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwathLibAssetService]
    });
  });

  it('should be created', inject([SwathLibAssetService], (service: SwathLibAssetService) => {
    expect(service).toBeTruthy();
  }));
});
