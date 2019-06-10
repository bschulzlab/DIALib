import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwathLibComponent } from './swath-lib.component';

describe('SwathLibComponent', () => {
  let component: SwathLibComponent;
  let fixture: ComponentFixture<SwathLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwathLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwathLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
