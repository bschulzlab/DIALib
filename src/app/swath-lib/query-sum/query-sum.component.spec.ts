import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuerySumComponent } from './query-sum.component';

describe('QuerySumComponent', () => {
  let component: QuerySumComponent;
  let fixture: ComponentFixture<QuerySumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuerySumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuerySumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
