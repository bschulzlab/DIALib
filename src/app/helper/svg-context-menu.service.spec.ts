import { TestBed, inject } from '@angular/core/testing';

import { SvgContextMenuService } from './svg-context-menu.service';

describe('SvgContextMenuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SvgContextMenuService]
    });
  });

  it('should be created', inject([SvgContextMenuService], (service: SvgContextMenuService) => {
    expect(service).toBeTruthy();
  }));
});
