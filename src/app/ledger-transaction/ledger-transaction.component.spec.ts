import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerTransactionComponent } from './ledger-transaction.component';

describe('LedgerTransactionComponent', () => {
  let component: LedgerTransactionComponent;
  let fixture: ComponentFixture<LedgerTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgerTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgerTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
