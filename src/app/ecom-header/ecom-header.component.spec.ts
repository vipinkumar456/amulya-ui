import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomHeaderComponent } from './ecom-header.component';

describe('EcomHeaderComponent', () => {
  let component: EcomHeaderComponent;
  let fixture: ComponentFixture<EcomHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
