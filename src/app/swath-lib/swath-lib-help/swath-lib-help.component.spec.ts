import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwathLibHelpComponent } from './swath-lib-help.component';

describe('SwathLibHelpComponent', () => {
  let component: SwathLibHelpComponent;
  let fixture: ComponentFixture<SwathLibHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwathLibHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwathLibHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
