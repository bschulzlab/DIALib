import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuerysetParameterFormComponent } from './queryset-parameter-form.component';

describe('QuerysetParameterFormComponent', () => {
  let component: QuerysetParameterFormComponent;
  let fixture: ComponentFixture<QuerysetParameterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuerysetParameterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuerysetParameterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
