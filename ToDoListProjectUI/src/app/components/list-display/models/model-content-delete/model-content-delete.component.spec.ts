import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelContentDeleteComponent } from './model-content-delete.component';

describe('ModelContentDeleteComponent', () => {
  let component: ModelContentDeleteComponent;
  let fixture: ComponentFixture<ModelContentDeleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelContentDeleteComponent]
    });
    fixture = TestBed.createComponent(ModelContentDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
