import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageGraphComponent } from './percentage-graph.component';

describe('PercentageGraphComponent', () => {
  let component: PercentageGraphComponent;
  let fixture: ComponentFixture<PercentageGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PercentageGraphComponent]
    });
    fixture = TestBed.createComponent(PercentageGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
