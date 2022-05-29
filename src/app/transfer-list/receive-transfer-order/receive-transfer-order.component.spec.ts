import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveTransferOrderComponent } from './receive-transfer-order.component';

describe('ReceiveTransferOrderComponent', () => {
  let component: ReceiveTransferOrderComponent;
  let fixture: ComponentFixture<ReceiveTransferOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveTransferOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveTransferOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
