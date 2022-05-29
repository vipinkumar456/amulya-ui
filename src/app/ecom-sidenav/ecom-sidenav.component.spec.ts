import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomSidenavComponent } from './ecom-sidenav.component';

describe('EcomSidenavComponent', () => {
  let component: EcomSidenavComponent;
  let fixture: ComponentFixture<EcomSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
