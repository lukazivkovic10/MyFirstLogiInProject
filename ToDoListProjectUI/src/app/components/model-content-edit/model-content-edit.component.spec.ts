import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelContentEditComponent } from './model-content-edit.component';

describe('ModelContentEditComponent', () => {
  let component: ModelContentEditComponent;
  let fixture: ComponentFixture<ModelContentEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelContentEditComponent]
    });
    fixture = TestBed.createComponent(ModelContentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
