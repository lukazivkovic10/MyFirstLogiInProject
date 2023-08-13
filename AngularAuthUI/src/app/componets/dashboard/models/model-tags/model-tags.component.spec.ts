import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelTagsComponent } from './model-tags.component';

describe('ModelTagsComponent', () => {
  let component: ModelTagsComponent;
  let fixture: ComponentFixture<ModelTagsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelTagsComponent]
    });
    fixture = TestBed.createComponent(ModelTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
