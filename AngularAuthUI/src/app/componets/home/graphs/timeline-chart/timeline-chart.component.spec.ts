import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineChartComponent } from './timeline-chart.component';

describe('TimelineChartComponent', () => {
  let component: TimelineChartComponent;
  let fixture: ComponentFixture<TimelineChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineChartComponent]
    });
    fixture = TestBed.createComponent(TimelineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
