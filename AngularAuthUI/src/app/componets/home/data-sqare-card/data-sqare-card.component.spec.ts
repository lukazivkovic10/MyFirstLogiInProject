import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSqareCardComponent } from './data-sqare-card.component';

describe('DataSqareCardComponent', () => {
  let component: DataSqareCardComponent;
  let fixture: ComponentFixture<DataSqareCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataSqareCardComponent]
    });
    fixture = TestBed.createComponent(DataSqareCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
