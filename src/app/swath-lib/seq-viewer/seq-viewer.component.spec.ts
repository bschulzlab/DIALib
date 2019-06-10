import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeqViewerComponent } from './seq-viewer.component';

describe('SeqViewerComponent', () => {
  let component: SeqViewerComponent;
  let fixture: ComponentFixture<SeqViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeqViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeqViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
