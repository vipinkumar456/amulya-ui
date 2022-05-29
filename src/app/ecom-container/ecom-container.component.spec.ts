import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomContainerComponent } from './ecom-container.component';

describe('EcomContainerComponent', () => {
  let component: EcomContainerComponent;
  let fixture: ComponentFixture<EcomContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
