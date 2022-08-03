import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingElementComponent } from './floating-element.component';

describe('FloatingElementComponent', () => {
  let component: FloatingElementComponent;
  let fixture: ComponentFixture<FloatingElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
