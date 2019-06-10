import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceSelectorComponent } from './sequence-selector.component';

describe('SequenceSelectorComponent', () => {
  let component: SequenceSelectorComponent;
  let fixture: ComponentFixture<SequenceSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SequenceSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
